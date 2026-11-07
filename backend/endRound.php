<?php
require_once "src/game.php";

try {
    $gameId = filter_input(INPUT_POST, "gameId", FILTER_SANITIZE_STRING);

    endRound($gameId);
} catch (Exception $e) {
    jsonError($e->getMessage());
}
