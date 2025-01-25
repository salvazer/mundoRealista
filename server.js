const http = require('http');
const fs = require('fs');
const path = require('path');

// Create necessary directories if they don't exist
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

// Ensure all required directories exist
ensureDirectoryExists(path.join(__dirname, 'html', 'imagenes360', 'characters'));

// Create server with error handling
const server = http.createServer((req, res) => {
    console.log(`Request received for: ${req.url}`);
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Clean and decode the URL
    let filePath = decodeURIComponent(req.url).replace(/\\/g, '/');
    
    // Remove query parameters if any
    filePath = filePath.split('?')[0];
    
    // Convert URL path to local file path
    filePath = path.join(__dirname, filePath === '/' ? 'tour360.html' : filePath.substring(1));
    
    console.log(`Resolved file path: ${filePath}`);

    // Security check - make sure file is within project directory
    if (!filePath.startsWith(__dirname)) {
        console.error('Attempted to access file outside project directory');
        res.writeHead(403);
        res.end('Access denied');
        return;
    }

    const extname = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    
    // Map file extensions to MIME types
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };

    contentType = mimeTypes[extname] || 'application/octet-stream';
    
    console.log(`Attempting to read file: ${filePath}`);
    console.log(`Content type: ${contentType}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error(`File does not exist: ${filePath}`);
        res.writeHead(404);
        res.end(`File not found: ${filePath}`);
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            console.error(`Error reading file ${filePath}:`, error);
            if(error.code === 'ENOENT') {
                res.writeHead(404);
                res.end(`File not found: ${filePath}`);
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            console.log(`Successfully read file: ${filePath}`);
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            });
            res.end(content);
        }
    });
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port 5000 is already in use. Please try a different port or close the application using port 5000.`);
        process.exit(1);
    }
});

const port = 5000;
const hostname = '127.0.0.1';

// Try to start the server
try {
    server.listen(port, hostname, () => {
        console.log('='.repeat(50));
        console.log(`Server started successfully`);
        console.log(`Server running at http://${hostname}:${port}/`);
        console.log(`Open your browser and navigate to http://${hostname}:${port}/tour360.html`);
        console.log(`Current directory: ${__dirname}`);
        console.log('='.repeat(50));
        
        // List all files in current directory
        fs.readdir('.', (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
            } else {
                console.log('\nFiles in current directory:');
                files.forEach(file => console.log(`- ${file}`));
                
                // Check if required files exist
                const requiredFiles = ['tour360.html', 'html'];
                const missingFiles = requiredFiles.filter(file => !files.includes(file));
                
                if (missingFiles.length > 0) {
                    console.error('\nWarning: Missing required files/directories:', missingFiles);
                }
            }
        });
    });
} catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
} 