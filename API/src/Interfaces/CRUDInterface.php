<?php

namespace Interfaces;

interface CRUDInterface {
    function create();
    function read($param);
    function update();
    function delete();
}