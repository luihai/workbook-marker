const fs = require('fs');
const path = require('path');

const width = 100;
const height = 100;
// Minimal 1x1 pixel PNG
const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

fs.writeFileSync(path.join(process.cwd(), 'test_image.png'), buffer);
console.log('test_image.png created');
