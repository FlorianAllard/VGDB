<?php

namespace Abstract;
use \PDO;
use \PDOStatement;

require_once __DIR__ . '/../services/_pdo.php';

abstract class AbstractModel {
    protected PDO $pdo;
    protected string $linkedClass = "SET IN INHERITOR CLASS";

    // Public

    public function __construct() {
        $this -> pdo = pdoConnection();
        $this -> pdo -> setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_CLASS);
    }

    // Protected

    protected function prepareQuery(string $query): PDOStatement {
        $sql = $this -> pdo -> prepare($query);
        $this -> setFetchMode($sql);
        return $sql;
    }

    protected function runQuery(string $query): PDOStatement {
        $sql = $this -> pdo -> query($query);
        $this -> setFetchMode($sql);
        return $sql;
    }

    // Private

    private function setFetchMode(PDOStatement &$sql): PDOStatement {
        $sql -> setFetchMode(PDO::FETCH_CLASS, $this ->linkedClass);
        return $sql;
    }
}