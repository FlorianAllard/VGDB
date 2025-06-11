<?php

/** Returns an instance of PDO connection to connect to the "blog" database
 *
 * @return \PDO
 */
function pdoConnection(): \PDO {
    try {
        $config = require __DIR__."/../config/_config.php";
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']};charset={$config['charset']};";
        $pdo = new \PDO($dsn, $config['user'], $config['password'], $config['options']);
        return $pdo;
    } catch (\PDOException $e) {
        throw new \PDOException($e -> getMessage(), (int) $e -> getCode());
    }
}