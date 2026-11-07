<?php
require_once "src/game.php";

try {
    $gameId = filter_input(INPUT_POST, "gameId", FILTER_SANITIZE_STRING);
    $token = filter_input(INPUT_POST, "token", FILTER_SANITIZE_STRING);
    $secret = filter_input(INPUT_POST, "secret", FILTER_SANITIZE_STRING);
    $videoId = filter_input(INPUT_POST, "videoId", FILTER_SANITIZE_STRING);
    $videoStartTime = filter_input(INPUT_POST, "videoStartTime", FILTER_VALIDATE_INT);

    pickVideo($gameId, $token, $secret, $videoId, $videoStartTime);
} catch (Exception $e) {
    jsonError($e->getMessage());
}
