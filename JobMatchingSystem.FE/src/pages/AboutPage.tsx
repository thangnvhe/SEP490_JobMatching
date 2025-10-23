import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Về Chúng Tôi</h1>
      <p>Đây là trang giới thiệu về Job Matching System.</p>
      <nav>
        <Link to="/">
          Về trang chủ
        </Link>
      </nav>
    </div>
  );
};

export default AboutPage;
