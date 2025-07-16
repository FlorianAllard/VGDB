<?php

namespace Interfaces;

use Abstract\AbstractEntity;

interface CRUDInterface {
    function create(array $post);
    function read(array $get);
    function update(array $post);
    function delete();
}