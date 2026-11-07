<?php
require_once "src/game.php";

try {
    $name = filter_input(INPUT_POST, "name", FILTER_SANITIZE_STRING);

    jsonResponse(createGame($name, $_SERVER["REMOTE_ADDR"]));
} catch (Exception $e) {
    jsonError($e->getMessage());
}
