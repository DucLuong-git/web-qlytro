const fs = require('fs');
const filepath = 'e:/FPL-WEB2091-BASE-main/FPL-WEB2091-BASE-main/fpl-web-app/src/pages/DashboardPage.jsx';
let lines = fs.readFileSync(filepath, 'utf8').split('\n');

// Lines 40-44 (0-indexed: 39-43) contain the object addNotification
// Replace lines 40-44 with the fixed version
lines.splice(39, 6, 
  "        // Kích hoạt chuông thông báo Realtime lên System Layout",
  "        addNotification('Hoá đơn mới ' + newInv.id + ' vừa xuất hiện. Email đã gửi tự động đến bạn.', 'info');",
  "      }, 120000); // Demo: Auto gen sau mỗi 2 phút"
);

fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
console.log('Done - lines fixed');
console.log('Verifying - line 40:', lines[39]);
