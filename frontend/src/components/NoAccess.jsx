const NoAccess = () => {
    const styles = {
        container: {
            textAlign: 'center',
            padding: '50px',
            color: '#ff4d4f',
            fontFamily: 'Arial, sans-serif',
        },
        icon: {
            fontSize: '80px',
            marginBottom: '20px',
        },
        title: {
            fontSize: '28px',
            marginBottom: '10px',
        },
        message: {
            fontSize: '18px',
            marginBottom: '30px',
        },
        button: {
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#ff4d4f',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.icon}>🚫</div>
            <h1 style={styles.title}>Bạn không có quyền truy cập</h1>
            <p style={styles.message}>Xin lỗi, bạn không có quyền truy cập vào trang này.</p>
            <button style={styles.button} onClick={() => window.history.back()}>
                Quay lại
            </button>
        </div>
    );
};

export default NoAccess;
