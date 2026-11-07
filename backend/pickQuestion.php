<?php
require_once "src/game.php";

try {
    $gameId = filter_input(INPUT_POST, "gameId", FILTER_SANITIZE_STRING);
    $token = filter_input(INPUT_POST, "token", FILTER_SANITIZE_STRING);
    $secret = filter_input(INPUT_POST, "secret", FILTER_SANITIZE_STRING);
    $questionIndex = filter_input(INPUT_POST, "questionIndex", FILTER_VALIDATE_INT);

    pickQuestion($gameId, $token, $secret, $questionIndex);
} catch (Exception $e) {
    jsonError($e->getMessage());
}
