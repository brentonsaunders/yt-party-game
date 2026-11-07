<?php
    $gameId = $_GET["gameId"] ?? null;
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>YT Party Game</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preload" href="img/animated/loading.gif" as="image">
        <link rel="stylesheet" href="css/index.css">
        <script><?php echo "const GAME_ID = " . ($gameId ? "\"$gameId\";" : "null;"); ?></script>
        <script src="js/lib/qrcode.min.js"></script>
        <script type="module" src="js/index.js"></script>
    </head>
    <body class="loading">
        <div id="app"></div>
    </body>
</html>
