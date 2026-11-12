<?php
require_once __DIR__ . "/../config.php";

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
        <script>
            const GAME_ID = <?php echo $gameId ? "\"$gameId\"" : "null" ?>;
            const API_BASE_URL = "<?php echo API_BASE_URL; ?>";
            const UI_BASE_URL = "<?php echo UI_BASE_URL; ?>";
            const USE_SESSION_STORAGE = <?php echo USE_SESSION_STORAGE ? "true" : "false"; ?>;
        </script>
        <script src="js/lib/qrcode.min.js"></script>
        <script type="module" src="js/index.js"></script>
    </head>
    <body class="loading">
        <div id="app"></div>
    </body>
</html>
