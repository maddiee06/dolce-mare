"use client";
import React from 'react';
import styles from './Loginform.module.scss';
import Image from 'next/image';
export type LoginformProps = {
	// types...
}

const Loginform: React.FC<LoginformProps> = ({ }) => {
	console.log(styles)
	return (
		<main className={styles.loginform}>
			<header className={styles.header}>
				<Image src="/logo_vertical.svg" alt="logo" width={181} height={55} />
			</header>
			<section className={styles.images}>
				<div className={styles.photo}>
					<Image src="/Gelato_de_pistacho.svg" alt="helado de pistacho en un bowl" fill />
				</div>
				<div className={styles.photo}>
					<Image src="/Helado_artesanal.svg" alt="cono de helado artesanal" fill />
				</div>
			</section>
			<section className={styles.card}>
				<h2 className={styles.title}>Un dulce comienzo</h2>
				<span className={styles.subtitle}>Ingresa a tu espacio de trabajo.</span>
				<div className={styles.field}>
					<div className={styles.fieldText}>
						<label htmlFor="usuario">Usuario</label>
						<input id="usuario" type="text" />
					</div>
					<Image src="/user-round.svg" alt="" width={20} height={20} />
				</div>
				<div className={styles.field}>
					<div className={styles.fieldText}>
						<label htmlFor="contrasena">Contraseña</label>
						<input id="contrasena" type="password" />
					</div>
					<Image src="/user-round.svg" alt="" width={20} height={20} />
				</div>
				<button type='button' className={styles.btncajero}><Image src="/credit-card.svg" alt="" width={20} height={20} />Ingresar Cajero</button>
				<button type='button' className={styles.btnadmin}><Image src="/credit-card.svg" alt="" width={20} height={20} />Ingresar Admin</button>
				<span className={styles.description}>Acceso exclusivo para el equipo Dolce Mare</span>
			</section>
			<footer className={styles.footer}>
				<span className={styles.location}>Chimbote · Ancash</span>
				<span className={styles.version}>Sistema de ventas y administración · v1.0</span>
			</footer>
		</main>
	);
};

export default Loginform;
