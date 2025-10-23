import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>404 - Không tìm thấy trang</h1>
      <p>Trang bạn đang tìm kiếm không tồn tại.</p>
      <Link to="/">
        Về trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;
