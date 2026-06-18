import { useEffect } from "react";
import { Icon } from "../Icon";
import styles from "./index.module.css";

export function Alert({ message, onClose, title = "Não foi possível entrar" }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.alert} role="alert">
      <div className={styles.alertIcon}>
        <Icon className={styles.alertIconSymbol}>error</Icon>
      </div>

      <div>
        <p className={styles.alertTitle}>{title}</p>
        <p className={styles.alertText}>{message}</p>
      </div>
    </div>
  );
}
