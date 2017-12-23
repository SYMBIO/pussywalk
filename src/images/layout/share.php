<?php
if (
    strpos($_SERVER["HTTP_USER_AGENT"], "facebookexternalhit/") !== false ||          
    strpos($_SERVER["HTTP_USER_AGENT"], "Facebot") !== false
) {
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta property="og:title" content="<?php if(isset($_GET['n'])) { echo $_GET['n']; } ?> zdolal/a PussyWalk II!">
	<meta property="og:type" content="website">
	<meta property="og:name" content="<?php if(isset($_GET['n'])) { echo $_GET['n']; } ?> zdolal/a PussyWalk II!">
	<meta property="og:url" content="http://pussywalk.com/images/layout/share.php?n=<?php if(isset($_GET['n'])) { echo $_GET['n']; } ?>&t=<?php if(isset($_GET['t'])) { echo $_GET['t']; } ?>">
	<meta property="og:description" content="Do cíle dovrávoral/a v čase <?php if(isset($_GET['t'])) { echo $_GET['t']; } ?> Vem pana Z. a Čtveráčka taky na procházku a přibliž je k urně. Překonáš můj čas?">
	<meta property="og:image" content="http://www.pussywalk.com/images/layout/fb-share-winner.png">
</head>
<body>
</body>
</html>
<?php
}
else {
    header('Location: http://pussywalk.com');
}
?>