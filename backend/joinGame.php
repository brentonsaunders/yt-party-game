<?php
require_once "src/game.php";

try {
    $gameId = filter_input(INPUT_POST, "gameId", FILTER_SANITIZE_STRING);
    $token = filter_input(INPUT_POST, "token", FILTER_SANITIZE_STRING);
    $name = filter_input(INPUT_POST, "name", FILTER_SANITIZE_STRING);
    $isActive = filter_input(INPUT_POST, "isActive", FILTER_VALIDATE_BOOL);

    jsonResponse(joinGame($gameId, $token, $name, $isActive));
} catch (Exception $e) {
    jsonError($e->getMessage());
}
