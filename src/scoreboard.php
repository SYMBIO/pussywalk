<?php

$fburl = "https://pussywalk-2.firebaseio.com/scoreboard.json?orderBy=\"time\"&limitToFirst=2";
$filename = "scoreboard.json";
$loadNew = false;
$now = time();

if (file_exists($filename)) {
  $loadNew = $loadNew || ($now - filemtime($filename) > 60);
} else {
  $loadNew = true;
}

if ($loadNew) {
  $json = file_get_contents($fburl);
  $file = fopen($filename,"w");
  fwrite($file,$json);
  fclose($file);
}

readfile($filename);

?>
