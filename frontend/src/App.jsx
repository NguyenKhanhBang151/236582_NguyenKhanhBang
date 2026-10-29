import { useEffect, useRef, useState } from 'react'
import './App.css'

// Dia chi Backend API - cau hinh qua bien moi truong VITE_API_URL (file .env cua frontend)
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const EMOJI_THEO_DANH_MUC = {
  'Món nước': '🍜',
  'Cơm': '🍚',
  'Đồ ăn nhanh': '🥖',
  'Tráng miệng': '🍰',
  'Đồ uống': '🥤',
}

const FORM_TRONG = {
  foodId: '',
  name: '',
  category: 'Món nước',
  cuisine: '',
  ingredientsText: '',
  price: '',
  quantity: '',
  description: '',
  imageUrl: '',
}

function App() {
  const [foods, setFoods] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loiKetNoi, setLoiKetNoi] = useState('')
  const [toast, setToast] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(FORM_TRONG)
  const formRef = useRef(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  async function taiDanhSach(tuKhoa) {
    setLoading(true)
    try {
      const query = tuKhoa && tuKhoa.trim() !== '' ? `?search=${encodeURIComponent(tuKhoa.trim())}` : ''
      const response = await fetch(`${API_BASE}/api/foods${query}`)
      if (!response.ok) throw new Error(`Backend tra loi loi ${response.status}`)
      const data = await response.json()
      setFoods(Array.isArray(data) ? data : [])
      setLoiKetNoi('')
    } catch (error) {
      setLoiKetNoi('Khong ket noi duoc Backend API. Hay kiem tra backend dang chay tai ' + API_BASE)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    taiDanhSach('')
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => taiDanhSach(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  function thongBao(type, text) {
    setToast({ type, text })
  }

  function resetForm() {
    setForm(FORM_TRONG)
    setEditingId(null)
    setShowForm(false)
  }

  function moFormThem() {
    resetForm()
    setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      foodId: form.foodId.trim(),
      name: form.name.trim(),
      category: form.category,
      cuisine: form.cuisine.trim(),
      ingredients: form.ingredientsText.split(',').map((x) => x.trim()).filter((x) => x !== ''),
      price: Number(form.price),
      quantity: form.quantity === '' ? 0 : Number(form.quantity),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    }
    if (!payload.foodId || !payload.name || form.price === '' || Number.isNaN(payload.price) || payload.price < 0) {
      thongBao('error', 'Vui lòng nhập mã món, tên món và giá hợp lệ (giá >= 0).')
      return
    }
    setSaving(true)
    try {
      const url = editingId ? `${API_BASE}/api/foods/${editingId}` : `${API_BASE}/api/foods`
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || `Thao tác thất bại (mã lỗi ${response.status})`)
      }
      thongBao('success', editingId ? `Đã cập nhật món "${payload.name}" thành công.` : `Đã thêm món "${payload.name}" thành công.`)
      resetForm()
      await taiDanhSach(search)
    } catch (error) {
      thongBao('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  function editFood(food) {
    setForm({
      foodId: food.foodId || '',
      name: food.name || '',
      category: food.category || 'Món nước',
      cuisine: food.cuisine || '',
      ingredientsText: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : '',
      price: String(food.price ?? ''),
      quantity: String(food.quantity ?? ''),
      description: food.description || '',
      imageUrl: food.imageUrl || '',
    })
    setEditingId(food._id)
    setDetail(null)
    setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  async function deleteFood(food) {
    if (!window.confirm(`Bạn có chắc muốn xóa món "${food.name}" không?`)) return
    try {
      const response = await fetch(`${API_BASE}/api/foods/${food._id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || `Xóa thất bại (mã lỗi ${response.status})`)
      thongBao('success', `Đã xóa món "${food.name}".`)
      setDetail(null)
      await taiDanhSach(search)
    } catch (error) {
      thongBao('error', error.message)
    }
  }

  const money = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

  const emojiCua = (food) => EMOJI_THEO_DANH_MUC[food.category] || '🍽️'

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span>🍽️</span> FoodManager</div>
        <p className="side-label">MENU QUẢN LÝ</p>
        <div className="side-item active">🍲 <span>Quản lý món ăn</span></div>
        <div className="side-item">📊 <span>Tổng quan</span></div>
        <div className="side-item">⚙️ <span>Cài đặt</span></div>
        <div className="sidebar-bottom">
          <div className="avatar">KB</div>
          <div><strong>Quản trị viên</strong><small>Administrator</small></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="eyebrow">HỆ THỐNG QUẢN LÝ</span><h1>Quản lý món ăn</h1></div>
          {loading
            ? <span className="status status-loading">● Đang tải dữ liệu...</span>
            : loiKetNoi
              ? <span className="status status-error">● Mất kết nối Backend</span>
              : <span className="status">● Đã kết nối API · MongoDB Atlas</span>}
        </header>

        <section className="welcome">
          <div>
            <p>THỨC ĂN NGON · QUẢN LÝ DỄ DÀNG</p>
            <h2>Xin chào, quản trị viên! 👋</h2>
            <span>Dữ liệu hiển thị được lấy trực tiếp từ MongoDB Atlas qua Backend API.</span>
          </div>
          <div className="welcome-emoji">🍜</div>
        </section>

        {loiKetNoi && <div className="alert-error">⚠️ {loiKetNoi}</div>}
        {toast && <div className={toast.type === 'success' ? 'toast toast-success' : 'toast toast-error'}>{toast.type === 'success' ? '✅' : '⚠️'} {toast.text}</div>}

        <section className="stats">
          <div className="stat-card"><span>Tổng số món ăn</span><strong>{foods.length}</strong><div>🍱 Danh sách hiện tại</div></div>
          <div className="stat-card"><span>Danh mục món ăn</span><strong>{new Set(foods.map((food) => food.category)).size}</strong><div>🗂️ Nhóm phân loại</div></div>
          <div className="stat-card"><span>Giá trung bình</span><strong>{foods.length ? money(Math.round(foods.reduce((sum, food) => sum + Number(food.price || 0), 0) / foods.length)) : '0 ₫'}</strong><div>💰 Theo danh sách hiện tại</div></div>
        </section>

        <section className="food-section">
          <div className="section-heading">
            <div><h2>Danh sách món ăn</h2><p>Thêm, tìm kiếm, xem chi tiết, chỉnh sửa và xóa món ăn.</p></div>
            <button className="primary-btn" onClick={moFormThem}>＋ Thêm món ăn</button>
          </div>

          <div className="toolbar">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="🔎  Tìm theo tên, danh mục hoặc vùng miền..." />
            <span>{loading ? 'Đang tải...' : `${foods.length} kết quả`}</span>
          </div>

          {showForm && (
            <form className="food-form" onSubmit={handleSubmit} ref={formRef}>
              <h3>{editingId ? '✏️ Cập nhật món ăn' : '➕ Thêm món ăn mới'}</h3>
              <div className="form-grid">
                <label>Mã món ăn (foodId) *
                  <input required value={form.foodId} onChange={(e) => setForm({ ...form, foodId: e.target.value })} placeholder="Ví dụ: MA04" />
                </label>
                <label>Tên món ăn *
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Phở bò" />
                </label>
                <label>Danh mục
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option>Món nước</option><option>Cơm</option><option>Đồ ăn nhanh</option><option>Tráng miệng</option><option>Đồ uống</option><option>Khác</option>
                  </select>
                </label>
                <label>Ẩm thực / Vùng miền
                  <input value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} placeholder="Ví dụ: Việt Nam - miền Bắc" />
                </label>
                <label>Giá (VNĐ) *
                  <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="50000" />
                </label>
                <label>Số lượng
                  <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="50" />
                </label>
                <label className="full-width">Nguyên liệu (cách nhau bằng dấu phẩy)
                  <input value={form.ingredientsText} onChange={(e) => setForm({ ...form, ingredientsText: e.target.value })} placeholder="Ví dụ: Bánh phở, Thịt bò, Hành tây" />
                </label>
                <label className="full-width">Đường dẫn hình ảnh (imageUrl)
                  <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://... (để trống thì dùng biểu tượng theo danh mục)" />
                </label>
                <label className="full-width">Mô tả
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả món ăn..." rows="3" />
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={resetForm}>Hủy</button>
                <button className="primary-btn" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm món ăn'}</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="empty">⏳<h3>Đang tải dữ liệu...</h3><p>Đang lấy danh sách món ăn từ Backend API.</p></div>
          ) : (
            <div className="food-grid">
              {foods.map((food) => (
                <article className="food-card" key={food._id}>
                  <div className="food-picture">
                    {food.imageUrl
                      ? <img className="food-img" src={food.imageUrl} alt={food.name} />
                      : <span>{emojiCua(food)}</span>}
                    <label>{food.category}</label>
                  </div>
                  <div className="food-content">
                    <h3>{food.name} <small className="food-code">{food.foodId}</small></h3>
                    <p>{food.description || 'Chưa có mô tả cho món ăn này.'}</p>
                    <div className="food-meta">
                      <span>🌏 {food.cuisine || 'Chưa rõ vùng miền'}</span>
                      <span>📦 Còn: {food.quantity ?? 0}</span>
                    </div>
                    <div className="food-bottom"><strong>{money(food.price)}</strong><div>
                      <button className="detail-btn" onClick={() => setDetail(food)} title="Xem chi tiết">👁️</button>
                      <button className="edit-btn" onClick={() => editFood(food)} title="Sửa món ăn">✏️</button>
                      <button className="delete-btn" onClick={() => deleteFood(food)} title="Xóa món ăn">🗑️</button>
                    </div></div>
                  </div>
                </article>
              ))}
              {foods.length === 0 && !loiKetNoi && (
                <div className="empty">🍽️<h3>Không tìm thấy món ăn</h3><p>Thử từ khóa khác hoặc thêm món mới nhé.</p></div>
              )}
            </div>
          )}
        </section>
        <footer>FoodManager © 2026 · Bài thực hành Điện toán đám mây</footer>
      </main>

      {detail && (
        <div className="detail-overlay" onClick={() => setDetail(null)}>
          <div className="detail-panel" onClick={(event) => event.stopPropagation()}>
            <div className="detail-head">
              <h3>{detail.name}</h3>
              <button className="secondary-btn" onClick={() => setDetail(null)}>✕ Đóng</button>
            </div>
            <div className="detail-picture">
              {detail.imageUrl ? <img className="food-img" src={detail.imageUrl} alt={detail.name} /> : <span>{emojiCua(detail)}</span>}
            </div>
            <dl className="detail-list">
              <div><dt>Mã món ăn</dt><dd>{detail.foodId}</dd></div>
              <div><dt>Danh mục</dt><dd>{detail.category}</dd></div>
              <div><dt>Ẩm thực / Vùng miền</dt><dd>{detail.cuisine || '—'}</dd></div>
              <div><dt>Giá</dt><dd>{money(detail.price)}</dd></div>
              <div><dt>Số lượng</dt><dd>{detail.quantity ?? 0}</dd></div>
              <div><dt>Nguyên liệu</dt><dd>{Array.isArray(detail.ingredients) && detail.ingredients.length ? detail.ingredients.join(', ') : '—'}</dd></div>
              <div><dt>Mô tả</dt><dd>{detail.description || '—'}</dd></div>
              <div><dt>Ngày tạo</dt><dd>{detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : '—'}</dd></div>
            </dl>
            <div className="form-actions">
              <button className="secondary-btn" onClick={() => deleteFood(detail)}>🗑️ Xóa món</button>
              <button className="primary-btn" onClick={() => editFood(detail)}>✏️ Sửa món</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
