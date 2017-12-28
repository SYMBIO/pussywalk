<?php

$fburl = "https://pussywalk-2.firebaseio.com/scoreboard.json?orderBy=\"time\"&limitToFirst=2";
$dirname = "cache";
$filename = "scoreboard.json";
$filepath = $dirname . "/" . $filename;
$loadNew = false;
$now = time();

echo "1";

if (!file_exists($dirname)) {
    mkdir($dirname, 0777);
    $loadNew = true;
}

echo "2";

if (file_exists($filepath)) {
  $loadNew = $loadNew || ($now - filemtime($filepath) > 60);
} else {
  $loadNew = true;
}

echo "3";

if ($loadNew) {
  echo "4";
  $json = file_get_contents($fburl);
  echo "5";
  file_put_contents($filepath, $json);
  echo "6";
  echo $json;
}

echo "7";

readfile($filepath);

?>
