<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

class UserRepository
{
    public function findByEmail(string $email): ?array
    {
        $stmt = db()->prepare('SELECT * FROM employees WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function findByIdentity(string $identity): ?array
    {
        $stmt = db()->prepare('SELECT * FROM employees WHERE email = :identity LIMIT 1');
        $stmt->execute(['identity' => $identity]);
        $user = $stmt->fetch();

        if ($user) {
            return $user;
        }

        // Strip "EMP-" to check the integer id
        $id = (int) str_ireplace('EMP-', '', $identity);
        
        if ($id > 0) {
            $stmt = db()->prepare('SELECT * FROM employees WHERE id = :id LIMIT 1');
            $stmt->execute(['id' => $id]);
            $user = $stmt->fetch();
            return $user ?: null;
        }

        return null;
    }

    public function findById(int $id): ?array
    {
        $stmt = db()->prepare('SELECT * FROM employees WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function all(): array
    {
        $stmt = db()->query('SELECT id, full_name, email, role, phone, created_at FROM employees ORDER BY created_at DESC');

        return $stmt->fetchAll();
    }

    public function create(array $data): array
    {
        $stmt = db()->prepare(
            'INSERT INTO employees (full_name, email, password_hash, role, phone, position, hire_date) VALUES (:full_name, :email, :password_hash, :role, :phone, :position, :hire_date)'
        );

        $stmt->execute([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'password_hash' => $data['password_hash'], // Plain password stored as-is
            'role' => $data['role'],
            'phone' => $data['phone'] ?? null,
            'position' => $data['role'] === 'admin' ? 'Administrator' : ($data['role'] === 'manager' ? 'Manager' : 'Employee'),
            'hire_date' => date('Y-m-d'),
        ]);

        return $this->findById((int)db()->lastInsertId());
    }

    public function updateProfile(int $id, array $data): array
    {
        $stmt = db()->prepare('UPDATE employees SET full_name = :full_name, phone = :phone WHERE id = :id');

        $stmt->execute([
            'full_name' => $data['full_name'],
            'phone' => $data['phone'] ?? null,
            'id' => $id,
        ]);

        return $this->findById($id);
    }

    public function updatePassword(int $id, string $passwordHash): void
    {
        $stmt = db()->prepare('UPDATE employees SET password_hash = :password WHERE id = :id');
        $stmt->execute([
            'password' => $passwordHash,
            'id' => $id,
        ]);
    }

    public function updateRole(int $id, string $role): array
    {
        $stmt = db()->prepare('UPDATE employees SET role = :role WHERE id = :id');
        $stmt->execute([
            'role' => $role,
            'id' => $id,
        ]);

        return $this->findById($id);
    }
}



