<?php

namespace Interfaces;

use Abstract\AbstractEntity;

interface CRUDInterface {
    function create(array $params);
    function read(array $params);
    function update();
    function delete();
}