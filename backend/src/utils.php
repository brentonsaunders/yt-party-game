<?php
function mysqlDateTime($timestamp = null) {
    return date("Y-m-d H:i:s", $timestamp);
}

function randomId($length = 6) {
    $chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";

    $id = "";

    for ($i = 0; $i < $length; ++$i) {
        $id .= $chars[random_int(0, strlen($chars) - 1)];
    }

    return $id;
}

function jsonResponse($payload) {
    header("Content-Type: application/json");

    echo json_encode($payload);
}

function jsonError($message) {
    http_response_code(400);

    header("Content-Type: application/json");

    echo json_encode(["error" => $message]);
}
