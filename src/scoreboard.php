<?php

ini_set('display_errors', 1); // set to 0 for production version
error_reporting(E_ALL);

$fburl = "https://pussywalk-2.firebaseio.com/scoreboard.json?orderBy=\"time\"&limitToFirst=2000";
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

  if (false === $file) {
    //
  } else {
    $result = fwrite($file, $json);
    fclose($file);
    }
  }

  readfile($filename);
?>
