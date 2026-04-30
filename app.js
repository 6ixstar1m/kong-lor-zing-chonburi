/* app.js */

const STORE_KEY = 'kongLorZingDB';

const AppStore = {
  db: {
    shopStatus: 'Open',
    holidays: [],
    bookings: []
  },

  init() {
    const data = localStorage.getItem(STORE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.socialMedia) parsed.socialMedia = { line: '', facebook: '', phone: '', youtube: '' };
      if (!parsed.branches) parsed.branches = [
        { name: 'สาขา 1 (ล้อ ยาง)', mapLink: '' },
        { name: 'สาขา 2 (จัดทรงช่วงล่าง โช้คอัพ ซ่อมเซอร์วิส)', mapLink: '' }
      ];
      this.db = parsed;
    } else {
      this.save();
    }
  },

  save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.db));
  },

  getShopStatus() { 
    const d = new Date();
    const today = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    const hour = d.getHours();
    const autoStatus = (hour >= 8 && hour < 20) ? 'Open' : 'Closed';

    if (this.db.shopStatusOverride && this.db.shopStatusOverride.date === today) {
      return this.db.shopStatusOverride.status;
    }
    return autoStatus;
  },
  setShopStatus(status) { 
    const d = new Date();
    const today = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    this.db.shopStatusOverride = { status, date: today };
    this.save(); 
  },
  getHolidays() { return this.db.holidays; },

  addHoliday(dateStr) {
    if (!this.db.holidays.includes(dateStr)) {
      this.db.holidays.push(dateStr);
      this.save();
    }
  },

  removeHoliday(dateStr) {
    this.db.holidays = this.db.holidays.filter(d => d !== dateStr);
    this.save();
  },

  getBookings() { return this.db.bookings; },

  addBooking(booking) {
    booking.id = 'Q' + Date.now().toString().slice(-4);
    this.db.bookings.push(booking);
    this.save();
    return booking;
  },

  getBookingByPhone(phone) {
    return this.db.bookings.filter(b => b.phone === phone);
  },

  deleteBooking(id) {
    this.db.bookings = this.db.bookings.filter(b => b.id !== id);
    this.save();
  },

  getSocialMedia() { return this.db.socialMedia; },
  setSocialMedia(data) { this.db.socialMedia = data; this.save(); },

  getBranches() { return this.db.branches; },
  setBranches(data) { this.db.branches = data; this.save(); }
};

function renderLoader() {
  const loader = document.createElement('div');
  loader.id = 'global-loader';
  loader.innerHTML = `
    <div class="wheel-loader"></div>
    <p class="mt-4 text-red-main font-bold text-lg tracking-widest">กำลังโหลด...</p>
  `;
  document.body.prepend(loader);

  setTimeout(() => {
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 500);
  }, 1000);
}

function renderHeader() {
  const headerId = document.getElementById('global-header');
  if (!headerId) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const getNavClass = (path) => currentPath === path ? 'text-red-500 border-b-2 border-red-500 pb-1' : 'hover:text-red-300 transition-colors pb-1 border-b-2 border-transparent';
  const getMobileClass = (path) => currentPath === path ? 'text-red-500' : 'text-gray-300 hover:text-white transition-colors';

  headerId.innerHTML = `
    <nav class="bg-[#050505] text-white shadow-2xl sticky top-0 z-50 border-b border-red-900/50">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <!-- Logo -->
        <a href="index.html" class="flex items-center space-x-3 text-2xl font-extrabold tracking-wide">
          <span class="text-red-main">ก้องล้อซิ่ง</span>
          <span class="text-gray-200">ชลบุรี</span>
        </a>
        
        <!-- Desktop Nav -->
        <div class="hidden md:flex flex-grow justify-end pr-4 items-center space-x-8 font-bold text-base mt-1">
          <a href="index.html" class="${getNavClass('index.html')} uppercase">หน้าแรก</a>
          <a href="booking.html" class="${getNavClass('booking.html')} uppercase">จองคิวรถ</a>
          <a href="track.html" class="${getNavClass('track.html')} uppercase">เช็คสถานะ</a>
        </div>

        <!-- Mobile Toggle -->
        <button id="mobile-menu-btn" class="md:hidden text-gray-300 hover:text-white focus:outline-none p-1">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div id="mobile-menu" class="hidden absolute left-0 w-full bg-[#0a0a0a] border-t border-red-900/30 md:hidden shadow-xl z-50">
        <div class="flex flex-col space-y-4 px-6 py-8 font-bold text-xl text-center">
          <a href="index.html" class="${getMobileClass('index.html')} border-b border-gray-900 pb-3">หน้าแรก</a>
          <a href="booking.html" class="${getMobileClass('booking.html')} border-b border-gray-900 pb-3">จองคิวรถ</a>
          <a href="track.html" class="${getMobileClass('track.html')} pb-2">เช็คสถานะ</a>
        </div>
      </div>
      
      <!-- Hidden Admin -->
      <a href="admin.html" class="absolute bottom-1 right-2 text-[10px] text-gray-800 hover:text-gray-500 leading-none" title="Admin">⚙️</a>
    </nav>
  `;

  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderLoader();
  AppStore.init();
  renderHeader();

  const path = window.location.pathname;

  if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
    initHome();
  } else if (path.endsWith('booking.html')) {
    initBooking();
  } else if (path.endsWith('admin.html')) {
    initAdmin();
  } else if (path.endsWith('track.html')) {
    initTrack();
  }
});

function initHome() {
  const statusEl = document.getElementById('shop-status');
  if (statusEl) {
    const status = AppStore.getShopStatus();
    let text = 'เปิดรับคิว';
    let colorClass = 'text-green-500';
    let icon = 'status-pulse-green';

    if (status === 'Closed') {
      text = 'คิวเต็ม / ปิดทำการ';
      colorClass = 'text-red-500';
      icon = 'status-pulse-red';
    }

    statusEl.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full bg-current ${icon}"></div>
        <span class="${colorClass} font-bold text-lg">${text}</span>
      </div>
    `;
  }

  // Render Upcoming Holidays
  const holidays = AppStore.getHolidays();
  const holidaysEl = document.getElementById('home-holidays');
  if (holidaysEl) {
    if (holidays.length > 0) {
      let hList = holidays.sort((a, b) => new Date(a) - new Date(b)).map(d => `<span class="bg-red-900/40 text-red-300 px-3 py-1 rounded text-sm font-mono border border-red-800">${d}</span>`).join(' ');
      holidaysEl.innerHTML = `
        <div class="bg-[#111] border border-red-900 p-4 rounded-lg mt-4 max-w-2xl mx-auto inline-block text-left w-full">
            <h3 class="text-lg font-bold text-red-500 mb-3 text-center">📅 แจ้งวันหยุดร้านเร็วๆ นี้</h3>
            <div class="flex flex-wrap items-center justify-center gap-2">${hList}</div>
        </div>
      `;
    } else {
      holidaysEl.innerHTML = '';
    }
  }

  // Render Daily Queue
  const datePicker = document.getElementById('home-date-picker');
  const dailyQueue = document.getElementById('home-daily-queue');
  
  if (datePicker && dailyQueue) {
    const renderDailyQueue = (dateStr) => {
      const allBkgs = AppStore.getBookings();
      const dayBkgs = allBkgs.filter(b => b.date === dateStr).sort((a,b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
      
      let html = '<div class="divide-y divide-gray-800">';
      if (dayBkgs.length === 0) {
        html += '<div class="p-8 text-center text-gray-500 text-lg">คิวว่าง (ยังไม่มีจองในวันนี้)</div>';
      } else {
        dayBkgs.forEach(b => {
          html += `
            <div class="px-6 py-5 flex flex-col md:flex-row justify-between md:items-center hover:bg-[#222] transition-colors gap-3">
              <div class="flex items-center space-x-4">
                <span class="text-red-500 font-bold bg-[#000] px-3 py-1 rounded text-lg border border-red-900/40">${b.time || 'ไม่ระบุ'}</span>
                <div>
                  <div class="font-bold text-white text-lg">${b.service}</div>
                  <div class="text-sm text-gray-400">สาขา: ${b.branch || 'ไม่ระบุสาขา'}</div>
                </div>
              </div>
              <div class="flex flex-col md:items-end justify-center space-y-2 text-sm mt-2 md:mt-0">
                <span class="text-gray-300">รถยนต์: ${b.carModel} (ทะเบียนซ่อนไว้)</span>
                <span class="px-3 py-1 text-xs rounded font-bold w-fit ${b.status === 'เสร็จแล้ว' ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-gray-800 text-gray-300'}">${b.status}</span>
              </div>
            </div>
          `;
        });
      }
      html += '</div>';
      dailyQueue.innerHTML = html;
    };

    const todayStr = new Date().toISOString().split('T')[0];
    datePicker.value = todayStr;
    renderDailyQueue(todayStr);

    datePicker.addEventListener('change', (e) => {
      renderDailyQueue(e.target.value);
    });
  }

  // Render Social and Maps
  const extraInfoEl = document.getElementById('home-extra-info');
  if (extraInfoEl) {
    const social = AppStore.getSocialMedia();
    const branches = AppStore.getBranches();

    let socialHTML = '<div class="flex justify-center space-x-4 mb-10 w-full flex-wrap gap-4">';
    if (social.line) socialHTML += `<a href="${social.line}" target="_blank" class="px-6 py-2 bg-[#00B900] text-white font-bold rounded-lg hover:opacity-80 transition-opacity">LINE</a>`;
    if (social.facebook) socialHTML += `<a href="${social.facebook}" target="_blank" class="px-6 py-2 bg-[#1877F2] text-white font-bold rounded-lg hover:opacity-80 transition-opacity">Facebook</a>`;
    if (social.youtube) socialHTML += `<a href="${social.youtube}" target="_blank" class="px-6 py-2 bg-[#FF0000] text-white font-bold rounded-lg hover:opacity-80 transition-opacity">YouTube</a>`;
    if (social.phone) socialHTML += `<a href="tel:${social.phone}" class="px-6 py-2 bg-gray-200 text-[#111] font-bold rounded-lg hover:bg-white transition-colors">โทร: ${social.phone}</a>`;
    socialHTML += '</div>';

    let mapHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">';
    branches.forEach(b => {
      mapHTML += `
        <div class="bg-[#111] p-6 rounded-lg border border-red-900 border-opacity-50 text-center flex flex-col items-center justify-center">
          <h3 class="text-xl font-bold mb-4 text-red-main">📍 ${b.name}</h3>
          ${b.mapLink ? `<a href="${b.mapLink}" target="_blank" class="btn-outline w-full max-w-[200px]">นำทาง Google Map</a>` : '<p class="text-gray-500 text-sm">ยังไม่เพิ่มพิกัด</p>'}
        </div>
      `;
    });
    mapHTML += '</div>';

    extraInfoEl.innerHTML = `
      <h2 class="text-3xl font-bold text-center mb-8">ช่องทางติดต่อ & สาขาของเรา</h2>
      ${socialHTML}
      ${mapHTML}
    `;
  }
}

function initBooking() {
  const form = document.getElementById('booking-form');
  const dateInput = document.getElementById('b-date');

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    dateInput.addEventListener('input', (e) => {
      const selectedDate = e.target.value;
      const holidays = AppStore.getHolidays();

      const day = new Date(selectedDate).getDay();

      if (holidays.includes(selectedDate)) {
        alert("ร้านปิดในวันที่เลือก หรือคิวเต็มแล้ว โปรดเลือกวันอื่น");
        e.target.value = '';
      }
    });
  }

  // Setup Dynamic Branches
  const bSelect = document.getElementById('branch-select');
  if (bSelect) {
    const branches = AppStore.getBranches();
    branches.forEach(b => {
      bSelect.innerHTML += `<option value="${b.name}">${b.name}</option>`;
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (AppStore.getShopStatus() !== 'Open') {
        alert('ไม่สามารถจองได้ ตอนนี้ร้านปิดรับคิวชั่วคราว');
        return;
      }

      const formData = new FormData(form);
      const booking = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        carModel: formData.get('car_model'),
        licensePlate: formData.get('license_plate'),
        branch: formData.get('branch'),
        service: formData.get('service'),
        note: formData.get('note') || '-',
        date: formData.get('date'),
        time: formData.get('time'),
        status: 'รอดำเนินการ'
      };

      const result = AppStore.addBooking(booking);

      document.getElementById('booking-success').classList.remove('hidden');
      document.getElementById('booking-success-ref').textContent = result.id;
      form.reset();

      setTimeout(() => {
        window.location.href = 'track.html?phone=' + encodeURIComponent(result.phone);
      }, 3000);
    });
  }
}

function initAdmin() {
  const statusSelect = document.getElementById('admin-status');
  if (statusSelect) {
    statusSelect.value = AppStore.getShopStatus();
    statusSelect.addEventListener('change', (e) => {
      AppStore.setShopStatus(e.target.value);
      alert('อัปเดตสถานะร้านเรียบร้อย');
    });
  }

  const holidayForm = document.getElementById('holiday-form');
  const holidaysList = document.getElementById('holidays-list');

  // Render Config Forms
  const socialConfigForm = document.getElementById('social-config-form');
  const branchConfigForm = document.getElementById('branch-config-form');

  if (socialConfigForm) {
    const social = AppStore.getSocialMedia();
    document.getElementById('social-line').value = social.line || '';
    document.getElementById('social-fb').value = social.facebook || '';
    document.getElementById('social-youtube').value = social.youtube || '';
    document.getElementById('social-phone').value = social.phone || '';

    socialConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();
      AppStore.setSocialMedia({
        line: document.getElementById('social-line').value,
        facebook: document.getElementById('social-fb').value,
        youtube: document.getElementById('social-youtube').value,
        phone: document.getElementById('social-phone').value,
      });
      alert('บันทึกช่องทางติดต่อเรียบร้อย');
    });
  }

  if (branchConfigForm) {
    const branches = AppStore.getBranches();
    document.getElementById('branch-1-name').value = branches[0].name || '';
    document.getElementById('branch-1-map').value = branches[0].mapLink || '';
    document.getElementById('branch-2-name').value = branches[1].name || '';
    document.getElementById('branch-2-map').value = branches[1].mapLink || '';

    branchConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();
      AppStore.setBranches([
        { name: document.getElementById('branch-1-name').value, mapLink: document.getElementById('branch-1-map').value },
        { name: document.getElementById('branch-2-name').value, mapLink: document.getElementById('branch-2-map').value }
      ]);
      alert('บันทึกพิกัดสาขาเรียบร้อย');
    });
  }

  const renderHolidays = () => {
    if (!holidaysList) return;
    const holidays = AppStore.getHolidays();
    holidaysList.innerHTML = '';

    if (holidays.length === 0) {
      holidaysList.innerHTML = '<p class="text-gray-500 text-sm">ยังไม่มีวันหยุดพิเศษ</p>';
      return;
    }

    holidays.sort().forEach(dateStr => {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center bg-[#151515] p-2 rounded mb-2 border border-gray-800';
      div.innerHTML = `
        <span class="font-bold text-white">${dateStr}</span>
        <button class="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded" data-date="${dateStr}">ลบ</button>
      `;
      holidaysList.appendChild(div);
    });
  };

  if (holidayForm) {
    renderHolidays();
    holidayForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dateVal = document.getElementById('h-date').value;
      if (dateVal) {
        AppStore.addHoliday(dateVal);
        holidayForm.reset();
        renderHolidays();
      }
    });

    holidaysList.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const dateRaw = e.target.getAttribute('data-date');
        AppStore.removeHoliday(dateRaw);
        renderHolidays();
      }
    });
  }

  const bookingsTbody = document.getElementById('bookings-tbody');
  const renderAdminBookings = () => {
    if (!bookingsTbody) return;
    const bookings = AppStore.getBookings();
    bookingsTbody.innerHTML = '';

    if (bookings.length === 0) {
      bookingsTbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-500">ไม่มีคิวจอง</td></tr>';
      return;
    }

    bookings.slice().reverse().forEach(b => {
      const tr = document.createElement('tr');
      tr.className = 'border-t border-gray-800 hover:bg-[#222] transition-colors';
      tr.innerHTML = `
        <td class="py-3 px-4 text-red-500 font-bold">${b.id}</td>
        <td class="py-3 px-4">${b.name} <br> <span class="text-xs text-gray-400">โทร: ${b.phone}</span></td>
        <td class="py-3 px-4 text-xs font-mono">🚗 ${b.carModel} <span class="bg-gray-800 px-1 rounded text-white">${b.licensePlate || '-'}</span><br>📍 ${b.branch || '-'}</td>
        <td class="py-3 px-4 text-sm max-w-[200px] break-words">
           <span class="font-bold">${b.service}</span>
           ${b.note && b.note !== '-' ? `<br><span class="text-[10px] text-yellow-500">📝 ${b.note}</span>` : ''}
           <br> <span class="text-xs text-red-400">📅 ${b.date} เวลา: ${b.time || '-'}</span>
        </td>
        <td class="py-3 px-4 flex flex-col items-start gap-1">
           <div class="flex items-center gap-1 w-full">
               <span class="px-2 py-1 text-xs text-white rounded w-full text-center ${b.status === 'เสร็จแล้ว' ? 'bg-green-700' : 'bg-gray-800'}">${b.status}</span>
           </div>
           <div class="flex items-center gap-1 w-full mt-1">
               ${b.status !== 'เสร็จแล้ว' ? `<button class="text-[10px] w-full bg-green-600 hover:bg-green-500 px-1 py-1 rounded text-white border border-green-800" onclick="markDone('${b.id}')">ทำเสร็จ</button>` : ''}
               <button class="text-[10px] w-full bg-red-800 hover:bg-red-600 px-1 py-1 rounded text-white border border-red-900" onclick="delBooking('${b.id}')">ลบ</button>
           </div>
        </td>
      `;
      bookingsTbody.appendChild(tr);
    });
  };

  renderAdminBookings();

  // Admin Login Logic
  const adminLogin = document.getElementById('admin-login');
  const adminContent = document.getElementById('admin-content');

  window.loginAdmin = function () {
    const u = document.getElementById('admin-user')?.value;
    const p = document.getElementById('admin-pass')?.value;
    if (u === 'kong' && p === '1150') {
      sessionStorage.setItem('adminLogged', 'true');
      adminLogin?.classList.add('hidden');
      adminContent?.classList.remove('hidden');
    } else {
      alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  if (sessionStorage.getItem('adminLogged') === 'true') {
    adminLogin?.classList.add('hidden');
    adminContent?.classList.remove('hidden');
  }

  // Mark Booking as Done
  window.markDone = function (id) {
    if (confirm('ยืนยันว่าทำรถเสร็จแล้ว?')) {
      const bkgs = AppStore.getBookings();
      const bkg = bkgs.find(b => b.id === id);
      if (bkg) {
        bkg.status = 'เสร็จแล้ว';
        AppStore.save();
        renderAdminBookings();
      }
    }
  };

  window.delBooking = function (id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคิวนี้? (ข้อมูลจะหายถาวร ไม่สามารถกู้คืนได้)')) {
      AppStore.deleteBooking(id);
      renderAdminBookings();
    }
  };
}

function initTrack() {
  const form = document.getElementById('track-form');
  const resultsDiv = document.getElementById('track-results');
  const urlParams = new URLSearchParams(window.location.search);
  const passedPhone = urlParams.get('phone');

  const doTrack = (phone) => {
    const list = AppStore.getBookingByPhone(phone);
    if (list.length === 0) {
      resultsDiv.innerHTML = '<div class="bg-red-900/30 border border-red-500 p-4 rounded text-red-200">ไม่พบคิวจากเบอร์โทรนี้</div>';
    } else {
      let html = '<h3 class="text-xl font-bold mb-4 border-b border-gray-800 pb-2">คิวของคุณ</h3><div class="space-y-4">';
      list.reverse().forEach(b => {
        html += `
          <div class="bg-[#111] border border-gray-800 p-4 rounded-lg relative overflow-hidden text-left">
            <div class="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">${b.status}</div>
            <p class="text-sm text-gray-400 mb-1">รหัสคิว: <span class="font-bold text-white">${b.id}</span></p>
            <h4 class="text-lg font-bold mb-1 break-words">${b.service}</h4>
            ${b.note && b.note !== '-' ? `<p class="text-sm text-yellow-600 mb-2 font-medium break-words">📝 หมายเหตุ: ${b.note}</p>` : ''}
            <p class="text-sm text-gray-400 mb-1">รถยนต์: ${b.carModel} <span class="bg-gray-800 px-1 rounded mx-1">${b.licensePlate || ''}</span></p>
            <p class="text-sm text-gray-400 mb-2">สาขา: ${b.branch || ''}</p>
            <p class="text-sm text-red-400 font-bold">วันที่นัด: ${b.date} เวลา ${b.time || ''}</p>
          </div>
        `;
      });
      html += '</div>';
      resultsDiv.innerHTML = html;
    }
    resultsDiv.classList.remove('hidden');
  };

  if (passedPhone && form) {
    document.getElementById('t-phone').value = passedPhone;
    doTrack(passedPhone);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      doTrack(document.getElementById('t-phone').value);
    });
  }
}
