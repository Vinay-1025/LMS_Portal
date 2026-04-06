const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');

dotenv.config();

const users = [
  {
    name: 'Platform Admin',
    email: 'admin@lms.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Campus Manager',
    email: 'management@lms.com',
    password: 'password123',
    role: 'management'
  },
  {
    name: 'Dr. Sarah Smith',
    email: 'tutor@lms.com',
    password: 'password123',
    role: 'tutor'
  },
  {
    name: 'John Doe (Student)',
    email: 'student@lms.com',
    password: 'password123',
    role: 'student'
  },
  {
    name: 'Guest Visitor',
    email: 'guest@lms.com',
    password: 'password123',
    role: 'outsider'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany({});
    console.log('Cleared existing users.');

    for (const user of users) {
      await User.create(user);
    }
    console.log('Successfully seeded users with hashed passwords!');

    await Course.deleteMany({});
    console.log('Cleared existing courses.');

    const tutor = await User.findOne({ role: 'tutor' });

    const sampleCourses = [
      {
        title: 'Full-Stack Web Development',
        description: 'Master the MERN stack with this comprehensive project-based course. Learn React, Node.js, and much more.',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
        tutor: tutor._id,
        price: 49.99,
        category: 'Web Development',
        level: 'Intermediate',
        status: 'Published',
        modules: [
          { title: 'Intro to React', type: 'video', url: 'https://www.youtube.com/embed/SqcY0GlETPk' },
          { title: 'React Hooks Mastery PDF', type: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
        ]
      },
      {
        title: 'Advanced UI/UX Design',
        description: 'Design stunning interfaces using Figma and modern design principles. Practice with real-world design systems.',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600',
        tutor: tutor._id,
        price: 39.99,
        category: 'Design',
        level: 'Advanced',
        status: 'Published',
        modules: [
          { title: 'Typography Guide', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
        ]
      }
    ];

    await Course.create(sampleCourses);
    console.log('Successfully seeded courses with content URLs!');

    // Seed Assessments
    const Assessment = require('./models/Assessment');
    await Assessment.deleteMany({});
    console.log('Cleared existing assessments.');

    const fullStackCourse = await Course.findOne({ title: 'Full-Stack Web Development' });

    const sampleAssessment = {
      title: 'React Fundamentals Quiz',
      description: 'Test your knowledge of hooks, components, and state management in React.',
      courseId: fullStackCourse._id,
      tutorId: tutor._id,
      timeLimit: 15,
      questions: [
        {
          text: 'What is the purpose of the useEffect hook in React?',
          options: [
            'To handle side effects like data fetching or subscriptions',
            'To create a new component',
            'To style a component',
            'To manage simple local state'
          ],
          correctIndex: 0,
          points: 10
        },
        {
          text: 'Which hook would you use to manage complex state logic in a component?',
          options: [
            'useState',
            'useReducer',
            'useMemo',
            'useCallback'
          ],
          correctIndex: 1,
          points: 10
        },
        {
          text: 'In React, components are primarily composed of what?',
          options: [
            'HTML and CSS',
            'Props and State',
            'Functions and Classes',
            'JSON and XML'
          ],
          correctIndex: 1,
          points: 10
        }
      ]
    };

    await Assessment.create(sampleAssessment);
    console.log('Successfully seeded sample assessments!');

    // Seed Coding Labs
    const Lab = require('./models/Lab');
    await Lab.deleteMany({});
    console.log('Cleared existing labs.');

    const sampleLabs = [
      {
        title: 'Hello World Challenge',
        description: 'Write a program that prints "Hello, World!" to the console. This is the first step in learning any new programming language.',
        category: 'Getting Started',
        level: 'Beginner',
        languages: ['javascript', 'python', 'java'],
        initialCode: {
          'javascript': 'console.log("Hello, World!");',
          'python': 'print("Hello, World!")',
          'java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
        },
        instructorId: tutor._id
      },
      {
        title: 'Fibonacci Sequence',
        description: 'Implement a function that calculates the nth Fibonacci number. The sequence starts with 0 and 1, and each subsequent number is the sum of the previous two.',
        category: 'Algorithms',
        level: 'Intermediate',
        languages: ['javascript', 'python'],
        initialCode: {
          'javascript': 'function fibonacci(n) {\n    // Your code here\n}\n\nconsole.log(fibonacci(10));',
          'python': 'def fibonacci(n):\n    # Your code here\n    pass\n\nprint(fibonacci(10))'
        },
        instructorId: tutor._id
      }
    ];

    await Lab.create(sampleLabs);
    console.log('Successfully seeded sample coding labs!');

    // Seed Channels
    const Channel = require('./models/Channel');
    await Channel.deleteMany({});
    console.log('Cleared existing channels.');

    const admin = await User.findOne({ role: 'admin' });
    const student = await User.findOne({ role: 'student' });
    
    const sampleChannels = [
      {
        name: 'General Announcements',
        type: 'broadcast',
        members: [admin._id, tutor._id, student._id]
      },
      {
        name: 'Full-Stack Web Development',
        type: 'course',
        course: fullStackCourse._id,
        members: [tutor._id, student._id]
      },
      {
        name: 'Tutor-Student DM',
        type: 'direct',
        members: [tutor._id, student._id]
      }
    ];

    await Channel.create(sampleChannels);
    console.log('Successfully seeded communication channels!');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
