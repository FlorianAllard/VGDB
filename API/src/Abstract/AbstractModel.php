<?php

namespace Abstract;

use Exception;
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
        $limit = "";
        $offset = "";
        foreach ($get as $key => $value) {
            if ($key === 'limit') {
                $limit = " LIMIT $value";
                continue;
            }
            if ($key === 'offset') {
                $offset = " OFFSET $value";
                continue;
            }

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

        

        return ['where' => $where . $limit . $offset, 'parameters' => $parameters];
    }

    /**
     * Insert data into a table. Supports both single-row (associative array) and multi-row (column => [values]) formats.
     *
     * @param string $table
     * @param array $data
     * @param bool $fetchAssoc
     * @return array
     */
    protected function insertInto(string $table, array $data, $fetchAssoc = false): array {
        if (empty($data)) return [];

        // Detect if $data is a single row (associative array) or multi-row (column => [values])
        $isMultiRow = false;
        foreach ($data as $value) {
            if (is_array($value)) {
                $isMultiRow = true;
                break;
            }
        }

        if (!$isMultiRow) {
            // Single row: convert to multi-row format for consistency
            foreach ($data as $key => $value) {
                $data[$key] = [$value];
            }
        }

        $columns = array_keys($data);
        $rowCount = count(reset($data));
        $placeholders = [];
        $values = [];

        for ($i = 0; $i < $rowCount; $i++) {
            $rowPlaceholders = [];
            foreach ($columns as $col) {
                $rowPlaceholders[] = '?';
                $values[] = $data[$col][$i];
            }
            $placeholders[] = '(' . implode(',', $rowPlaceholders) . ')';
        }

        $columnsToUpdate = array_filter($columns, function($column) {
            return $column != 'createdAt';
        });
        $updateClause = implode(', ', array_map(function($column) {
            return "`$column`=VALUES(`$column`)";
        }, $columnsToUpdate));

        $sql = $this->prepareQuery(
            "INSERT INTO $table (`" . implode('`,`', $columns) . "`) VALUES " . implode(',', $placeholders) .
            " ON DUPLICATE KEY UPDATE $updateClause RETURNING *"
        );

        $sql->execute($values);
        return $fetchAssoc ? $sql->fetch(PDO::FETCH_ASSOC) : $sql->fetchAll();
    }

    // Private

    private function setFetchMode(PDOStatement &$sql): PDOStatement {
        $sql -> setFetchMode(PDO::FETCH_CLASS, $this ->linkedClass);
        return $sql;
    }
}