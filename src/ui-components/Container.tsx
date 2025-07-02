import styles from "./Container.module.css";

interface ContainerProps {
  children: React.ReactNode;
  title?: string;
}

const Container: React.FC<ContainerProps> = ({ children, title }) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

export default Container;
