<?php
require_once __DIR__ . "/../constants/questions.php";
require_once __DIR__ . "/../constants/videos.php";
require_once __DIR__ . "/../constants/constants.php";
require_once "ClientException.php";
require_once __DIR__ . "/../../config.php";
require_once "utils.php";

function getDb() {
    static $db = null;

    if ($db) {
        return $db;
    }

    $db = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);

    return $db;
}

function randomGameId() {
    do {
        $id = randomId(6);
    } while (loadGame($id));

    return $id;
}

function loadGame($id) {
    $db = getDb();

    $stmt = $db->prepare("SELECT * FROM games WHERE id=:id");

    $stmt->execute(["id" => $id]);

    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$game) {
        return null;
    }

    $game["players"] = json_decode($game["players"], true) ?? [];
    $game["currentRound"] = json_decode($game["currentRound"], true) ?? [];
    $game["rounds"] = json_decode($game["rounds"], true) ?? [];

    return $game;
}

function gameJson($game, $token = null, $secret = null) {
    $gameArray = [
        "id" => $game["id"],
        "name" => $game["name"],
        "state" => $game["state"],
        "timeRemaining" => $game["stateChangeTime"]
            ? strtotime($game["stateChangeTime"]) - time()
            : null,
        "players" => array_map(fn($player) => [
            "name" => $player["name"],
            "isActive" => $player["isActive"],
        ], $game["players"]),
        "tokens" => TOKENS,
        "totalRounds" => count($game["rounds"]),
    ];

    if (array_key_exists($token, $game["players"]) &&
        $game["players"][$token]["secret"] === $secret
    ) {
        $myPlayer = $game["players"][$token];

        $gameArray["myPlayer"] = [
            "token" => $token,
            "name" => $myPlayer["name"],
            "isActive" => $myPlayer["isActive"],
        ];

        if ($game["currentRound"] && array_key_exists($token, $game["currentRound"])) {
            $myRound = $game["currentRound"]["$token"];

            $gameArray["myRound"] = [
                "questions" => $myRound["questions"],
                "pickedQuestion" => $myRound["pickedQuestion"],
                "videoId" => $myRound["videoId"],
                "videoStartTime" => $myRound["videoStartTime"],
                "guesses" => $myRound["guesses"],
            ];
        }
    }

    if (in_array($game["state"], [GUESSING_QUESTIONS, SHOWING_RESULTS, ENDING_ROUND])) {
        $videos = [];

        foreach ($game["currentRound"] as $token => $player) {
            $video = [
                "videoId" => $player["videoId"],
                "videoStartTime" => $player["videoStartTime"],
                "questions" => $player["questions"],
            ];

            if ($game["state"] === SHOWING_RESULTS || $game["state"] === ENDING_ROUND) {
                $video["pickedQuestion"] = $player["pickedQuestion"];
            }

            $videos[$player["videoIndex"]] = $video;
        }

        $gameArray["videos"] = $videos;

        $gameArray["allPlayersGuessed"] = count(
            array_filter(
                $game["currentRound"],
                fn($player) => count($player["guesses"]) < count($game["currentRound"]),
            )
        ) === 0;
    }

    $gameArray["scores"] = calculateScores($game);

    return $gameArray;
}

function saveGame($game) {
    $db = getDb();

    $stmt = $db->prepare("UPDATE games
                          SET state=:state,
                          stateChangeTime=:stateChangeTime,
                          players=:players,
                          currentRound=:currentRound,
                          rounds=:rounds
                          WHERE id=:id");

    $stmt->execute([
        "state" => $game["state"],
        "stateChangeTime" => $game["stateChangeTime"],
        "players" => json_encode($game["players"]),
        "currentRound" => json_encode($game["currentRound"]),
        "rounds" => json_encode($game["rounds"]),
        "id" => $game["id"],
    ]);
}

function gameWasRecentlyCreated($ip) {
    $db = getDb();

    $stmt = $db->prepare("SELECT * FROM games
                          WHERE ip=:ip AND
                          createTime > NOW() - INTERVAL 90 SECOND");

    $stmt->execute(["ip" => $ip]);

    return !!$stmt->fetch(PDO::FETCH_ASSOC);
}

function createGame($name, $ip) {
    if (!strlen($name)) {
        throw new ClientException("Name missing");
    }

    if (gameWasRecentlyCreated($ip)) {
        throw new ClientException("Rate limit exceeded");
    }

    $db = getDb();

    $query = "INSERT INTO games (id, name, state, createTime, ip)
              VALUES (:id, :name, :state, NOW(), :ip)";

    $stmt = $db->prepare($query);

    $id = randomGameId();

    $stmt->execute([
        "id" => $id,
        "name" => $name,
        "state" => LOBBY,
        "ip" => $ip,
    ]);

    return [
        "gameId" => $id,
    ];
}

function updateGame($gameId) {
    if (!($game = loadGame($gameId))) {
        return null;
    }

    if ($game["state"] === LOBBY || time() < strtotime($game["stateChangeTime"])) {
        return $game;
    }

    if ($game["state"] === STARTING_ROUND) {
        $activePlayers = array_keys(
            array_filter($game["players"], fn($player) => $player["isActive"])
        );

        if (count($activePlayers) < 4) {
            throw new ClientException("Not enough players");
        }

        shuffle($activePlayers);

        $r = new \Random\Randomizer();

        $currentRound = [];

        for ($i = 0; $i < count($activePlayers); ++$i) {
            $token = $activePlayers[$i];

            $currentRound[$token] = [
                "questions" => array_slice($r->shuffleArray(QUESTIONS), 0, 4),
                "pickedQuestion" => null,
                "videoId" => null,
                "videoStartTime" => 0,
                "videoIndex" => $i,
                "guesses" => [],
            ];
        }

        $game["state"] = PICKING_QUESTION;
        $game["stateChangeTime"] = mysqlDateTime(time() + TIME_TO_PICK_QUESTION);
        $game["currentRound"] = $currentRound;
    } else if ($game["state"] === PICKING_QUESTION) {
        $game["state"] = PICKING_VIDEO;
        $game["stateChangeTime"] = mysqlDateTime(time() + TIME_TO_PICK_VIDEO);

        // Any players who have yet to pick a question have one chosen for them
        foreach ($game["currentRound"] as $token => &$player) {
            $player["pickedQuestion"] ??= random_int(0, 3);
        }
    } else if ($game["state"] === PICKING_VIDEO) {
        $game["state"] = GUESSING_QUESTIONS;
        $game["stateChangeTime"] = mysqlDateTime(time() + TIME_TO_GUESS_QUESTIONS);

        // Any players who have yet to pick a video have one chosen for them
        foreach ($game["currentRound"] as $token => &$player) {
            $player["videoId"] ??= VIDEOS[random_int(0, count(VIDEOS) - 1)];
        }
    } else if ($game["state"] === GUESSING_QUESTIONS) {
        $game["state"] = SHOWING_RESULTS;
    } else if ($game["state"] === ENDING_ROUND) {
        $game["state"] = LOBBY;
        $game["stateChangeTime"] = null;
        $game["rounds"][] = $game["currentRound"];
        $game["currentRound"] = null;

        foreach ($game["players"] as &$player) {
            $player["isActive"] = false;
        }
    }

    saveGame($game);

    return $game;
}

function joinGame($gameId, $token, $name, $isActive) {
    if (!in_array($token, TOKENS)) {
        throw new ClientException("Invalid token");
    }

    if (!($game = loadGame($gameId))) {
        throw new ClientException("Invalid game");
    }

    $players = &$game["players"];

    if (!strlen($name)) {
        if (!$players[$token]) {
            throw new ClientException("Name missing");
        } else {
            $name = $players[$token]["name"];
        }
    }

    $secret = uniqid();

    $players[$token] = [
        "name" => $name,
        "isActive" => $isActive,
        "secret" => $secret,
    ];

    saveGame($game);

    return [
        "name" => $name,
        "isActive" => $isActive,
        "token" => $token,
        "secret" => $secret,
    ];
}

function startRound($gameId) {
    if (!($game = updateGame($gameId))) {
        throw new ClientException("Invalid game");
    }

    if ($game["state"] === LOBBY) {
        $game["state"] = STARTING_ROUND;
        $game["stateChangeTime"] = mysqlDateTime(time() + TIME_TO_START_ROUND);
    } else if ($game["state"] === STARTING_ROUND) {
        $game["state"] = LOBBY;
    } else {
        throw new ClientException("Invalid game state");
    }

    saveGame($game);
}

function pickQuestion($gameId, $token, $secret, $questionIndex) {
    if (!is_int($questionIndex) || $questionIndex < 0 || $questionIndex > 3) {
        throw new ClientException("Invalid question");
    }

    if (!($game = updateGame($gameId))) {
        throw new ClientException("Invalid game");
    }

    if ($game["state"] !== PICKING_QUESTION) {
        throw new ClientException("Invalid game state");
    }

    if (!array_key_exists($token, $game["currentRound"]) ||
        $game["players"][$token]["secret"] !== $secret
    ) {
        throw new ClientException("Invalid player");
    }

    $game["currentRound"][$token]["pickedQuestion"] = $questionIndex;

    saveGame($game);
}

function pickVideo($gameId, $token, $secret, $videoId, $videoStartTime = 0) {
    if (!preg_match("/^[A-Za-z0-9_\-]{11}$/", $videoId)) {
        throw new ClientException("Invalid video ID");
    }

    if (!is_int($videoStartTime) || $videoStartTime < 0) {
        throw new ClientException("Invalid video start time");
    }

    if (!($game = updateGame($gameId))) {
        throw new ClientException("Invalid game");
    }

    if ($game["state"] !== PICKING_VIDEO) {
        throw new ClientException("Invalid game state");
    }

    if (!array_key_exists($token, $game["currentRound"]) ||
        $game["players"][$token]["secret"] !== $secret
    ) {
        throw new ClientException("Invalid player");
    }

    $game["currentRound"][$token]["videoId"] = $videoId;
    $game["currentRound"][$token]["videoStartTime"] = $videoStartTime;

    saveGame($game);
}

function guessQuestion($gameId, $token, $secret, $videoIndex, $questionIndex) {
    if (!is_int($questionIndex) || $questionIndex < 0 || $questionIndex > 3) {
        throw new ClientException("Invalid question");
    }

    if (!($game = updateGame($gameId))) {
        throw new ClientException("Invalid game");
    }

    if ($game["state"] !== GUESSING_QUESTIONS) {
        throw new ClientException("Invalid game state");
    }

    if (!array_key_exists($token, $game["currentRound"]) ||
        $game["players"][$token]["secret"] !== $secret
    ) {
        throw new ClientException("Invalid player");
    }

    if (!is_int($videoIndex) || $videoIndex < 0 || $videoIndex > count($game["currentRound"]) - 1) {
        throw new ClientException("Invalid video");
    }

    $game["currentRound"][$token]["guesses"][$videoIndex] = $questionIndex;

    saveGame($game);
}

function endRound($gameId) {
    if (!($game = updateGame($gameId))) {
        throw new ClientException("Invalid game");
    }

    if ($game["state"] === SHOWING_RESULTS) {
        $game["state"] = ENDING_ROUND;
        $game["stateChangeTime"] = mysqlDateTime(time() + TIME_TO_END_ROUND);
    } else if ($game["state"] === ENDING_ROUND) {
        $game["state"] = SHOWING_RESULTS;
    } else {
        throw new ClientException("Invalid game state");
    }

    saveGame($game);
}

function calculateScores($game) {
    $scores = [];

    foreach (array_keys($game["players"]) as $token) {
        $total = 0;
        $rounds = [];
        $cumulative = [];

        foreach ($game["rounds"] as $round) {
            // Did the player participate in this round?
            if (!array_key_exists($token, $round)) {
                $rounds[] = null;

                $cumulative[] = count($cumulative)
                    ? $correct + $cumulative[count($cumulative) - 1]
                    : $correct;

                continue;
            }

            $correct = 0;

            // Count the player's correct guesses for this round
            $guesses = $round[$token]["guesses"];

            for ($i = 0; $i < count($guesses); ++$i) {
                // Find the corresponding video
                foreach (array_keys($round) as $otherToken) {
                    if ($i === $round[$otherToken]["videoIndex"]) {
                        if ($guesses[$i] === $round[$otherToken]["pickedQuestion"]) {
                            ++$correct;
                        }

                        break;
                    }
                }
            }

            $total += $correct;

            $rounds[] = $correct;

            $cumulative[] = count($cumulative)
                ? $correct + $cumulative[count($cumulative) - 1]
                : $correct;
        }

        $scores[$token] = [
            "total" => $total,
            "rounds" => $rounds,
            "cumulative" => $cumulative,
        ];
    }

    return $scores;
}
