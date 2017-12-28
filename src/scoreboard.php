<?php

$fburl = "https://pussywalk-2.firebaseio.com/scoreboard.json?orderBy=\"time\"&limitToFirst=2";
$dirname = "cache";
$filename = "scoreboard.json";
$filepath = $dirname . "/" . $filename;
$loadNew = false;
$now = time();

if (!file_exists($dirname)) {
    mkdir($dirname, 0777);
    $loadNew = true;
}

if (file_exists($filepath)) {
  $loadNew = $loadNew || ($now - filemtime($filepath) > 60);
} else {
  $loadNew = true;
}

if ($loadNew) {
  $json = file_get_contents($fburl);
  $r = file_put_contents($filepath, $json);
  echo ">" . $r . "<";
}

readfile($filepath);

?>
