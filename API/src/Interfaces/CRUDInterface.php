<?php

namespace Interfaces;

interface CRUDInterface {
    function create();
    function read(array $params);
    function update();
    function delete();
}