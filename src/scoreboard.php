<?php

ini_set('display_errors', 1); // set to 0 for production version
error_reporting(E_ALL);

$fburl = "https://pussywalk-2.firebaseio.com/scoreboard.json?orderBy=\"time\"&limitToFirst=2";
$filename = "scoreboard.json";
$loadNew = false;
$now = time();

if (file_exists($filename)) {
  $loadNew = $loadNew || ($now - filemtime($filename) > 6);
} else {
  $loadNew = true;
}

if ($loadNew) {
  $json = file_get_contents($fburl);
  $file = fopen($filename,"w");

  chmod($filename, 0755);

  echo realpath($filename);
  echo "<br />";

  echo substr(sprintf('%o', fileperms($filename)), -4);
  echo "<br />";

  if (false === $file) {
    echo "cant open file .(";
    echo "<br />";
  }
$result = fwrite($file, $json);

echo "result: " . $result;
echo "<br />";

  if($result) {
    echo "written .)";
    echo "<br />";
  } else {
    echo "can't write .(";
    echo "<br />";
  }
  fclose($file);
}

readfile($filename);

?>
