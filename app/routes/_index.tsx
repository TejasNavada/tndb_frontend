
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { validateToken } from '../lib/authService';

export default function IndexRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("tndb_token");
    if (token) {
      validateToken(token).then((isValid) => {
        console.log(isValid)
        if (isValid) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);
  return null;
}