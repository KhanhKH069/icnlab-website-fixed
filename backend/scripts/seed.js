const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const News = require('../models/News');
const Publication = require('../models/Publication');
const Project = require('../models/Project');
const Member = require('../models/Member');

dotenv.config();

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await News.deleteMany({});
        await Publication.deleteMany({});
        await Project.deleteMany({});
        await Member.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const adminUser = await User.create({
            email: 'admin@ptit.edu.vn',
            password: 'admin123',
            name: 'Admin ICN Lab',
            role: 'admin'
        });
        console.log('👤 Created admin user');

        // Create sample members
        const members = await Member.create([
            {
                name: 'TS. Nguyễn Văn A',
                email: 'nguyenvana@ptit.edu.vn',
                position: 'professor',
                bio: 'Chuyên gia về mạng 5G/6G và IoT',
                researchInterests: ['5G/6G Networks', 'IoT Security', 'Edge Computing'],
                joinDate: new Date('2020-01-01'),
                isActive: true,
                order: 1
            },
            {
                name: 'ThS. Trần Thị B',
                email: 'tranthib@ptit.edu.vn',
                position: 'assistant_professor',
                bio: 'Nghiên cứu về Edge Computing và AI',
                researchInterests: ['Edge Computing', 'Artificial Intelligence', 'Machine Learning'],
                joinDate: new Date('2021-03-15'),
                isActive: true,
                order: 2
            },
            {
                name: 'Lê Văn C',
                email: 'levanc@ptit.edu.vn',
                position: 'phd_student',
                bio: 'Nghiên cứu sinh chuyên về IoT Security',
                researchInterests: ['IoT Security', 'Cryptography', 'Network Security'],
                joinDate: new Date('2022-09-01'),
                isActive: true,
                order: 3
            }
        ]);
        console.log('👥 Created sample members');

        // Create sample news
        const news = await News.create([
            {
                title: 'Chúc Mừng Năm Mới Xuân Bính Ngọ 2026',
                content: 'Nhân dịp Tết Nguyên đán Bính Ngọ 2026, Lab Mạng Kết Nối Thông Minh (PTIT) xin gửi lời chúc an khang, thịnh vượng và vạn sự như ý tới toàn thể các thầy cô, các bạn sinh viên, đối tác và cộng đồng nghiên cứu. Chúc mọi người một năm mới tràn đầy sức khỏe, thành công và hạnh phúc!',
                category: 'announcement',
                author: adminUser._id,
                publishedDate: new Date('2026-01-29'),
                isPublished: true
            },
            {
                title: 'ICN Lab and Global Partners Spearhead the EIDT Conference',
                content: 'The Intelligently Connected Networks Lab, in collaboration with global partners, is proud to lead the organization of the International Conference on Emerging Innovations in Digital Technologies (EIDT). This prestigious event brings together researchers, practitioners, and industry leaders from around the world.',
                category: 'conference',
                author: adminUser._id,
                publishedDate: new Date('2026-01-20'),
                isPublished: true
            },
            {
                title: 'Lab Members Take Key Roles at ICIT Conference',
                content: 'Several members of ICN Lab have been appointed to key positions at the International Conference on Information Technology (ICIT). This recognition highlights the lab\'s contributions to the research community.',
                category: 'conference',
                author: adminUser._id,
                publishedDate: new Date('2026-01-15'),
                isPublished: true
            }
        ]);
        console.log('📰 Created sample news');

        // Create sample publications
        const publications = await Publication.create([
            {
                title: 'On Performance Evaluation of Fountain Codes-Based Multicast Scheme in Presence of Multiple Passive Eavesdroppers Over INID Rayleigh Fading Channels',
                authors: ['T. D. Dat', 'T. T. Duy', 'N. T. Hieu', 'P. N. An', 'N. L. Nhat', 'P. T. Tin'],
                venue: 'The First International Conference on Communications and Networks',
                year: 2025,
                type: 'conference',
                isPublished: true,
                publishedDate: new Date('2025-05-15')
            },
            {
                title: 'Đánh Giá Hiệu Năng Mạng Chuyển Tiếp Đa Chặng Bảo Mật Lớp Vật Lý Sử Dụng NOMA Dưới Ảnh Hưởng Của Nhiễu Đồng Kênh',
                authors: ['Phạm Xuân Minh', 'Nguyễn Quang Sang', 'Từ Lâm Thanh', 'Trần Trung Duy', 'Nguyễn Ngọc Lan'],
                venue: 'Hội nghị Quốc gia về Điện tử, Truyền thông và Công nghệ Thông tin',
                year: 2025,
                type: 'conference',
                isPublished: true,
                publishedDate: new Date('2025-12-01')
            },
            {
                title: 'Outage Performance of Fountain Codes based Two-way Relaying Scheme Using Digital Network Coding under Hardware Impairments',
                authors: ['N. T. Hau', 'P. M. Nam', 'T. T. Duy'],
                venue: 'The 7th International Symposium on Signal Processing Systems (SSPS 2025)',
                year: 2025,
                type: 'conference',
                isPublished: true,
                publishedDate: new Date('2025-05-20')
            }
        ]);
        console.log('📚 Created sample publications');

        // Create sample projects
        const projects = await Project.create([
            {
                title: 'Edge Computing for Smart Agriculture',
                description: 'Developing TinyML solutions for resource-constrained IoT devices in agricultural settings',
                fullDescription: 'This project focuses on optimizing machine learning models for deployment on microcontrollers used in smart agriculture applications. We aim to enable real-time analytics at the edge while minimizing power consumption.',
                category: 'edge_computing',
                status: 'ongoing',
                startDate: new Date('2024-01-01'),
                members: [members[0]._id, members[2]._id],
                technologies: ['TinyML', 'TensorFlow Lite', 'Arduino', 'ESP32'],
                isPublished: true
            },
            {
                title: 'Federated Learning for IoT Security',
                description: 'Implementing privacy-preserving machine learning for IoT threat detection',
                fullDescription: 'Developing federated learning frameworks that allow IoT devices to collaboratively train security models without sharing raw data, ensuring privacy and security.',
                category: 'iot_security',
                status: 'ongoing',
                startDate: new Date('2023-06-01'),
                members: [members[1]._id, members[2]._id],
                technologies: ['Federated Learning', 'PyTorch', 'Differential Privacy'],
                isPublished: true
            },
            {
                title: 'Semantic Communication for 6G Networks',
                description: 'Pioneering semantic communication frameworks for next-generation wireless networks',
                fullDescription: 'Research on semantic communication systems that prioritize meaningful information transmission over traditional bit-level communication, enabling more efficient use of spectrum resources.',
                category: '5g_6g',
                status: 'planned',
                startDate: new Date('2026-03-01'),
                members: [members[0]._id, members[1]._id],
                technologies: ['6G', 'Semantic Communication', 'AI/ML', 'ISAC'],
                isPublished: true
            }
        ]);
        console.log('🔬 Created sample projects');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('Email: admin@ptit.edu.vn');
        console.log('Password: admin123');
        console.log('\n⚠️  Please change the default password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
