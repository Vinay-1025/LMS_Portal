const Lab = require('../models/Lab');
const Workspace = require('../models/Workspace');

// Get all labs
exports.getLabs = async (req, res) => {
    try {
        const labs = await Lab.find().populate('instructorId', 'name');
        res.json(labs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single lab by ID
exports.getLabById = async (req, res) => {
    try {
        const lab = await Lab.findById(req.params.id).populate('instructorId', 'name');
        if (!lab) return res.status(404).json({ message: 'Lab not found' });
        res.json(lab);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get student's workspace for a specific lab
exports.getWorkspace = async (req, res) => {
    try {
        const { labId, language } = req.query;
        let workspace = await Workspace.findOne({
            labId,
            studentId: req.user._id,
            language
        });

        if (!workspace) {
            // If no workspace exists, we don't error, we just return null 
            // and the frontend will use the initial code from the Lab model.
            return res.json(null);
        }

        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Auto-save student progress
exports.saveWorkspace = async (req, res) => {
    try {
        const { labId, language, code } = req.body;

        const existing = await Workspace.findOne({ labId, studentId: req.user._id, language });
        if (existing && existing.status === 'Submitted') {
            return res.status(403).json({ message: 'Cannot edit a submitted workspace' });
        }

        let workspace = await Workspace.findOneAndUpdate(
            { labId, studentId: req.user._id, language },
            { code, lastSaved: Date.now() },
            { new: true, upsert: true } // Create if doesn't exist
        );

        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Log proctoring incident
exports.logIncident = async (req, res) => {
    try {
        const { labId, language, type, details } = req.body;
        const workspace = await Workspace.findOneAndUpdate(
            { labId, studentId: req.user._id, language },
            { 
                $push: { incidents: { type, details, timestamp: new Date() } } 
            },
            { new: true, upsert: true }
        );
        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Final submit lab
exports.submitLab = async (req, res) => {
    try {
        const { labId, language } = req.body;
        const workspace = await Workspace.findOneAndUpdate(
            { labId, studentId: req.user._id, language },
            { status: 'Submitted', lastSaved: Date.now() },
            { new: true }
        );

        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all submissions for a lab (Tutor only)
exports.getLabSubmissions = async (req, res) => {
    try {
        const lab = await Lab.findById(req.params.id);
        if (!lab) return res.status(404).json({ message: 'Lab not found' });

        if (req.user.role !== 'admin' && lab.instructorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized reporting access' });
        }

        const submissions = await Workspace.find({ labId: req.params.id })
            .populate('studentId', 'name email')
            .sort({ updatedAt: -1 });
        
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new lab (Tutor only)
exports.createLab = async (req, res) => {
    try {
        const lab = await Lab.create({
            ...req.body,
            instructorId: req.user._id
        });
        res.status(201).json(lab);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
