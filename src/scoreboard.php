<?php

$fburl = "https://pussywalk-2.firebaseio.com/scoreboard.json?orderBy=\"time\"&limitToFirst=2000";
$dirname = "cache";
$filename = "scoreboard.json";
$filepath = $dirname . "/" . $filename;
$loadNew = false;
$now = time();

$filedate = filemtime($filepath);

if (!file_exists($dirname)) {
    mkdir($dirname, 0777);
    $loadNew = true;
}

$loadNew = $loadNew || ($now - filemtime($filepath) > 60);

if ($loadNew) {
  $json = file_get_contents($fburl);
  file_put_contents($filepath, $json);
}

readfile($filepath);

?>
