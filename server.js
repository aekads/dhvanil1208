const express = require("express");
const session = require("express-session");
const sessionConfig = require("./src/middlewares/sessionConfig");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const loginRoutes = require("./src/routes/loginRoutes");
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { Sequelize, DataTypes } = require('sequelize');
const cloudinary = require('./src/config/cloudinaryConfig');
const app = express();
const api = require('./src/controllers/api.controller');
const moment = require('moment-timezone');
const axios = require('axios');
const db = require("./src/config/dbConnection");
const schedule = require('node-schedule');

// Database setup
const sequelize = new Sequelize('dbhk4x9gwus6mw', 'u3m7grklvtlo6', 'AekAds@24', {
  host: '35.209.89.182',
  dialect: 'postgres'
});

// Define models
const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM,
    values: ['admin', 'editor', 'viewer'],
    allowNull: false,
  },
});
const OTP = sequelize.define('OTP', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Log = sequelize.define('Log', {
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Log2 = sequelize.define('Log2', {
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false
  }
});


// Function to fetch external IP
const getExternalIP = async () => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error fetching external IP:', error);
    return 'Unknown IP';
  }
};

// Middleware for logging actions
const logAction = async (req, action, message) => {
  const ip = await getExternalIP();
  await Log.create({ action, message, ip });
};


const logAction2 = async (req, action, message) => {
  const ip = await getExternalIP();
  await Log2.create({ action, message, ip });
};


// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.logAction = logAction;
  next();
});

// Routes
app.use("/Dashboard", dashboardRoutes.router);

app.get("/", (req, res) => {
  res.render("Login", { message: null });      
});

app.get('/alldata', api.getAllScreensAllData);
app.get('/viewdata', api.viewData);
app.get('/livedata', api.getAllScreensAllData);

app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const allowedRoles = ['admin', 'editor', 'viewer'];

  // Check if the role is one of the allowed roles
  if (!allowedRoles.includes(role)) {
    req.flash('error_msg', 'Invalid role selected.');
    return res.redirect('/register');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword, role });

  // Log the registration action
  await logAction(req, 'register', 'User registered');
  await logAction2(req, 'register', 'User registered');


  res.redirect('/Dashboard/Teams/Addmember');
});

app.get('/login', (req, res) => {
  res.render('Login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user && await bcrypt.compare(password, user.password)) {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ userId: user.id, otp });
    req.session.otp = otp;
    req.session.user = user;

    // Send OTP via email
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aekads.otp@gmail.com',
        pass: 'ntkp cloo wjnx atep'
      }
    });

    let mailOptions = {
      from: 'aekads.otp@gmail.com',
      to: user.email,
      subject: 'Your login OTP Code',
      text: `Your login OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    // Log the login action
    await logAction(req, 'login', 'User logged in');

    res.redirect('/verify-otp');
  } else {
    req.flash('error_msg', 'Invalid email or password. Please check and try again.');
    res.redirect('/');
  }
});

app.get('/verify-otp', (req, res) => {
  res.render('verify-otp');
});

app.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;
  const savedOtp = await OTP.findOne({ where: { userId: req.session.user.id, otp } });
  
  if (savedOtp) {
    const otpCreationTime = savedOtp.createdAt;
    const currentTime = new Date();
    const timeDifference = (currentTime - otpCreationTime) / 1000; // Time difference in seconds

    if (timeDifference > 60) {
      await OTP.destroy({ where: { id: savedOtp.id } });
      req.flash('error_msg', 'OTP has expired. Please request a new one.');
      console.log('OTP expired');
      res.redirect('/verify-otp');
    } else {
      await OTP.destroy({ where: { id: savedOtp.id } });
    
      res.redirect('/Dashboard');
    }
  } else {
    req.flash('error_msg', 'Invalid OTP. Please check and try again.');
    res.redirect('/verify-otp');
  }
});

app.post('/resend-otp', async (req, res) => {
  const user = req.session.user;
  if (user) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ userId: user.id, otp });

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aekads.otp@gmail.com',
        pass: 'ntkp cloo wjnx atep'
      }
    });

    let mailOptions = {
      from: 'aekads.otp@gmail.com',
      to: user.email,
      subject: 'Your login OTP Code',
      text: `Your login OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.json({ success: false });
      } else {
        console.log('Email sent: ' + info.response);
        res.json({ success: true });
      }
    });
  } else {
    res.json({ success: false });
  }
});

// Function to fetch Cloudinary storage data
const getCloudinaryStorageData = async () => {
  try {
    const result = await cloudinary.api.usage();
    console.log('Cloudinary Storage Data:', result); // Debug log
    return result;
  } catch (error) {
    console.error('Error fetching Cloudinary storage data:', error);
  }
};

app.get('/api/cloudinary-storage', async (req, res) => {
  const data = await getCloudinaryStorageData();
  res.json(data);
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/logs', dashboardRoutes.isAuthenticated, async (req, res) => {
  try {
    const logs = await Log.findAll({
      order: [['createdAt', 'DESC']]
    });        

    // Convert timestamps to IST
    const logsWithIST = logs.map(log => ({
      ...log.dataValues,
      createdAt: moment(log.createdAt).tz('Asia/Kolkata').format('HH:mm:ss DD-MM-YYYY')
    }));

    res.render('logs', { logs: logsWithIST });
  } catch (error) { 
    console.error('Error fetching logs:', error);
    req.flash('error_msg', 'Error fetching logs. Please try again.');
    res.redirect('/Dashboard');
  }
});


// Route to display all users
app.get('/admin/users',dashboardRoutes.isAuthenticated, async (req, res) => {
  const user = req.session.user;

 
  try {
    const users = await User.findAll();
    res.render('admin-users', { users });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while fetching users.');
    res.redirect('/');
  }
});

// Route to get the edit user form
app.get('/admin/users/:id/edit', async (req, res) => {
  const user = req.session.user;
  const userId = req.params.id;

 
  try {
    const userToEdit = await User.findOne({ where: { id: userId } });

    if (!userToEdit) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/admin/users');
    }

    res.render('edit-user', { user: userToEdit });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while fetching the user.');
    res.redirect('/admin/users');
  }
});

// Route to update a user's profile
app.post('/admin/users/:id/edit', async (req, res) => {
  const { name, email, role, currentPassword, newPassword, confirmNewPassword } = req.body;
  const allowedRoles = ['admin', 'editor', 'viewer'];
  const userId = req.params.id;

  // Check if the role is one of the allowed roles
  if (!allowedRoles.includes(role)) {
    req.flash('error_msg', 'Invalid role selected.');
    return res.redirect(`/admin/users/${userId}/edit`);
  }

  try {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/admin/users');
    }

    // Update user details
    user.name = name;
    user.email = email;
    user.role = role;

    if (currentPassword || newPassword || confirmNewPassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        req.flash('error_msg', 'Please fill in all password fields.');
        return res.redirect(`/admin/users/${userId}/edit`);
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        req.flash('error_msg', 'Current password is incorrect.');
        return res.redirect(`/admin/users/${userId}/edit`);
      }

      if (newPassword !== confirmNewPassword) {
        req.flash('error_msg', 'New passwords do not match.');
        return res.redirect(`/admin/users/${userId}/edit`);
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    await logAction(req, 'Profile Edit', 'User Profile edited');
    await logAction2(req, 'edit Profile', 'User edit');
    req.flash('success_msg', 'User updated successfully.');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while updating the user.');
    res.redirect(`/admin/users/${userId}/edit`);
  }
});


// Route to delete a user
app.post('/admin/users/:id/delete', async (req, res) => {
  const user = req.session.user;
  const userId = req.params.id;


  try {
    const userToDelete = await User.findOne({ where: { id: userId } });

    if (!userToDelete) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/admin/users');
    }

    // Delete the user
    await userToDelete.destroy();
    req.flash('success_msg', 'User deleted successfully.');
    await logAction(req, 'Profile Delete', 'User Profile deleted');
    await logAction2(req, 'Profile Delete', 'User Profile deleted');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while deleting the user.');
    res.redirect('/admin/users');
  }
});
app.get('/admin/logs', dashboardRoutes.isAuthenticated, async (req, res) => {
  try {
    const logs = await Log2.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Convert timestamps to IST
    const logsWithIST = logs.map(log => ({
      ...log.dataValues,
      createdAt: moment(log.createdAt).tz('Asia/Kolkata').format('HH:mm:ss DD-MM-YYYY')
    }));

    res.render('log', { logs: logsWithIST });
  } catch (error) {
    console.error('Error fetching logs:', error);
    req.flash('error_msg', 'Error fetching logs. Please try again.');
    res.redirect('/Dashboard');
  }
});

const job = schedule.scheduleJob('* * * * *', async () => {
  console.log('Scheduled job running every minute:', new Date());
  // Every minute
  try {
    const now = new Date();

   
    const maxSlots1 = 100; // Adjust this to the maximum number of slots
const conditions1 = [];

for (let slot = 1; slot <= maxSlots1; slot++) {
  conditions1.push(
    `(slot${slot}_updatetime <= $1 AND slot${slot}_updatetime IS NOT NULL AND slot${slot}_update_status = 'pending')`
  );
}

const query1 = `
  SELECT * FROM playlists1235 
  WHERE ${conditions1.join(' OR ')}
`;

const updateResult = await db.query(query1, [now]);
console.log('Current timestamp:', now);




    for (const row of updateResult.rows) {
      // Update slots in screens table based on the update time
      for (let slot = 1; slot <= 100; slot++) {
        const updatetimeField = `slot${slot}_updatetime`;
        const updateStatusField = `slot${slot}_update_status`;
        const slotField = `slot${slot}`;
      
        if (row[updatetimeField] <= now && row[updatetimeField] !== null && row[updateStatusField] === 'pending') {
          await db.query(`UPDATE screens SET ${slotField} = $1 WHERE screenid = ANY($2::INTEGER[])`, [
            row[slotField],
            row.screen_id,
          ]);
          await db.query(`UPDATE playlists1235 SET ${updateStatusField} = 'completed' WHERE id = $1`, [row.id]);
          console.log(`Slot ${slot} data transferred to screens table for playlist ID ${row.id}`);
        }
      }
     
    }


    const maxSlots = 100; // Adjust this to the maximum number of slots
    const conditions = [];
    
    for (let slot = 1; slot <= maxSlots; slot++) {
      conditions.push(
        `(slot${slot}_deletetime <= $1 AND slot${slot}_deletetime IS NOT NULL AND slot${slot}_delete_status = 'pending')`
      );
    }
    
    const query = `
      SELECT * FROM playlists1235 
      WHERE ${conditions.join(' OR ')}
    `;
    
    const deleteResult = await db.query(query, [now]);
    


    for (const row of deleteResult.rows) {
      // Delete slots from screens table based on the delete time
      for (let slot = 1; slot <= 100; slot++) {
        const deletetimeField = `slot${slot}_deletetime`;
        const deleteStatusField = `slot${slot}_delete_status`;
      
        if (row[deletetimeField] <= now && row[deletetimeField] !== null && row[deleteStatusField] === 'pending') {
          await db.query(`UPDATE screens SET slot${slot} = NULL WHERE screenid = ANY($1::INTEGER[])`, [row.screen_id]);
          await db.query(`UPDATE playlists1235 SET ${deleteStatusField} = 'completed' WHERE id = $1`, [row.id]);
          console.log(`Slot ${slot} data set to NULL in screens table for playlist ID ${row.id}`);
        }
      }
     }
  } catch (err) {
    console.error('Error during periodic task:', err);
  }
});


// Sync database and start server
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
});
 
