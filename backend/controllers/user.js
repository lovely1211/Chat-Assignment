const db = require('../config/db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, contactNumber, role, password } = req.body;

    // Check if user exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const [existingContact] = await db.query('SELECT * FROM users WHERE contactNumber = ?', [contactNumber]);
    if (existingContact.length > 0) {
      return res.status(400).json({ message: 'Contact number already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const [result] = await db.query(
      'INSERT INTO users (name, email, contactNumber, role, password) VALUES (?, ?, ?, ?, ?)',
      [name, email, contactNumber, role, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { name, email, contactNumber, role } = req.body;

    // Update the user in the database
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ?, contactNumber = ?, role = ? WHERE id = ?',
      [name, email, contactNumber, role, req.params.id]
    );

    // Check if the user was found and updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the updated user data
    const [updatedUser] = await db.query(
      'SELECT id, name, email, contactNumber, role FROM users WHERE id = ?',
      [req.params.id]
    );

    // Check if the user exists in the database
    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({ message: 'Failed to fetch updated user data' });
    }

    // Respond with the updated user data
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser[0], 
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all Users
exports.getAllUser = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM messaging_app.users');
    
    // Include the fetched user data in the response
    res.status(200).json({
      message: 'Users fetched successfully',
      users: result, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

