<?php
header('Content-type: application/json');
$anotherObj = new stdClass();
$anotherObj->cases = 33319782;
$anotherObj->recovered = 28816557;
$anotherObj->died = 0;
$anotherObj->date = "6/6/2023";

$data = new stdClass();
$data->data = [];
array_push($data->data,$anotherObj);

$myJSON = json_encode($data);

echo $myJSON;

?>