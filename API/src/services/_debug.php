<?php

function debug_to_console($data)
{
    $output = $data;
    if (is_array($output))
        $output = implode(',', $output);

    var_dump("SERVER DEBUG: " . $output) ;
}