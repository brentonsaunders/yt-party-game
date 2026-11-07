<?php
require_once "src/game.php";

try {
    $gameId = filter_input(INPUT_GET, "gameId", FILTER_SANITIZE_STRING);
    $token = filter_input(INPUT_GET, "token", FILTER_SANITIZE_STRING);
    $secret = filter_input(INPUT_GET, "secret", FILTER_SANITIZE_STRING);

    $game = updateGame($gameId);

    jsonResponse($game ? gameJson($game, $token, $secret) : null);
} catch (Exception $e) {
    jsonError($e->getMessage());
}
