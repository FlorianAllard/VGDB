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

    protected function formatGetStatements($get): array {
        $conditions = [];
        $parameters = [];
        foreach ($_GET as $key => $value) {
            if ($key === 'limit') continue;
            if ($key === 'offset') continue;

            $valueArray = explode(",", $value);
            $invert = str_ends_with($key, "!");
            $key = rtrim($key, "!");
            $condString = "$key " . ($invert ? "NOT " : "") . "IN (";
            for ($i = 0; $i < count($valueArray); $i++) {
                $condString .=  ":$key$i" . ($i < count($valueArray) - 1 ? "," : "");
                $parameters[":$key$i"] = $valueArray[$i];
            }
            $condString .= ")";
            $conditions[] = $condString;
        }
        $where = count($conditions)
            ? "WHERE " . implode(" AND ", $conditions)
            : "";

        return ['where' => $where, 'parameters' => $parameters];
    }

    // Private

    private function setFetchMode(PDOStatement &$sql): PDOStatement {
        $sql -> setFetchMode(PDO::FETCH_CLASS, $this ->linkedClass);
        return $sql;
    }
}