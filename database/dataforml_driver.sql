-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dataforml
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `driver`
--

DROP TABLE IF EXISTS `driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver` (
  `driverid` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `vehicle_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `plate_number` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `rating_avg` decimal(3,2) DEFAULT NULL,
  `rating_count` int DEFAULT NULL,
  PRIMARY KEY (`driverid`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver`
--

LOCK TABLES `driver` WRITE;
/*!40000 ALTER TABLE `driver` DISABLE KEYS */;
INSERT INTO `driver` VALUES (1,'Trần Văn Bảy','tranvanbay@example.com','0905111222','1995-03-15','Male','Online','2025-10-18 08:42:23','Xe máy','59-P1 123.45',4.85,150),(2,'Nguyễn Thị Lan','nguyenlan@example.com','0912345678','1998-07-20','Female','Offline','2025-10-18 08:42:23','Xe máy','51-G2 987.65',4.90,210),(3,'Lê Minh Hùng','lehung@example.com','0987654321','1990-11-01','Male','Delivering','2025-10-18 08:42:23','Xe máy','75-A1 111.22',4.70,80),(4,'Phạm Đức Tuấn','tuanpham@example.com','0977889900','2001-01-25','Male','Online','2025-10-18 08:42:23','Xe máy','29-H1 333.44',4.95,300),(5,'Vũ Hoàng Anh','vuanh@example.com','0933445566','1996-09-12','Male','Banned','2025-10-18 08:42:23','Xe máy','60-B3 555.66',3.50,45),(6,'Hồ Thị Thu','hothu@example.com','0945678123','1999-05-05','Female','Online','2025-10-18 08:42:23','Xe máy','59-K2 777.88',4.88,120),(7,'Đặng Quốc Bảo','baodang@example.com','0909123789','1988-08-30','Male','Offline','2025-10-18 08:42:23','Xe máy','59-T2 999.00',4.60,505),(8,'Mai Tấn Phát','phatmai@example.com','0918765432','1992-02-14','Male','Delivering','2025-10-18 08:42:23','Xe máy','61-C1 123.45',4.75,230),(9,'Bùi Văn Nam','buinam@example.com','0988112233','1997-06-18','Male','Online','2025-10-18 08:42:23','Xe máy','52-U1 234.56',4.82,175),(10,'Đỗ Mỹ Linh','linhdo@example.com','0966778899','2000-12-07','Female','Online','2025-10-18 08:42:23','Xe máy','59-V1 345.67',4.91,95),(11,'Trịnh Công Sơn','sontrinh@example.com','0905556677','1985-04-19','Male','Offline','2025-10-18 08:42:23','Xe ba gác','60-X3 456.78',4.50,60),(12,'Lý Văn Dũng','dungly@example.com','0933112233','1993-10-22','Male','Delivering','2025-10-18 08:42:23','Xe máy','59-L1 567.89',4.77,310),(13,'Hoàng Thị Kim Chi','chikim@example.com','0912345987','1994-07-03','Female','Online','2025-10-18 08:42:23','Xe máy','51-F4 678.90',4.98,420),(14,'Phan Thanh Bình','binhphan@example.com','0977113355','1991-01-01','Male','Online','2025-10-18 08:42:23','Xe tải','51-D 123.45',4.65,110),(15,'Châu Minh Triết','trietchau@example.com','0908123123','1999-03-29','Male','Pending','2025-10-18 08:42:23','Xe máy','59-N2 789.01',4.60,30);
/*!40000 ALTER TABLE `driver` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-19 18:31:30
