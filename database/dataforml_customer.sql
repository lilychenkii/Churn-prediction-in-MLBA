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
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `customerid` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`customerid`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (3,'nguyenvana','pass123','Nguyễn Văn An','nguyenvana@example.com','0912345678','1990-05-15','Male','2025-10-18 08:37:58','Active'),(4,'tranthib','pass123','Trần Thị Bình','tranthib@example.com','0987654321','1992-08-22','Female','2025-10-18 08:37:58','Active'),(5,'lehoangc','pass123','Lê Hoàng Cường','lehoangc@example.com','0905123456','1988-11-30','Male','2025-10-18 08:37:58','Inactive'),(6,'phamthuyd','pass123','Phạm Thuỳ Dung','phamthuyd@example.com','0978901234','1995-02-10','Female','2025-10-18 08:37:58','Active'),(7,'hoangvane','pass123','Hoàng Văn Em','hoangvane@example.com','0934567890','2000-07-07','Male','2025-10-18 08:37:58','Active'),(8,'vothik','pass123','Võ Thị Kim','vothik@example.com','0918765432','1998-09-18','Female','2025-10-18 08:37:58','Banned'),(9,'dinhminhh','pass123','Đinh Minh Hải','dinhminhh@example.com','0909112233','1993-04-25','Male','2025-10-18 08:37:58','Active'),(10,'doanl','pass123','Đoàn Văn Lợi','doanl@example.com','0945678901','1985-12-01','Male','2025-10-18 08:37:58','Active'),(11,'buihoam','pass123','Bùi Hoa Mai','buihoam@example.com','0967890123','1991-06-12','Female','2025-10-18 08:37:58','Active'),(12,'dangquocn','pass123','Đặng Quốc Nam','dangquocn@example.com','0923456789','1997-03-28','Male','2025-10-18 08:37:58','Inactive'),(13,'truongg','pass123','Trương Văn Giàu','truongg@example.com','0911223344','1994-10-05','Male','2025-10-18 08:37:58','Active'),(14,'hothuyq','pass123','Hồ Thuý Quỳnh','hothuyq@example.com','0988776655','1996-01-20','Female','2025-10-18 08:37:58','Active'),(15,'ngokienp','pass123','Ngô Kiến Phong','ngokienp@example.com','0905554433','1999-08-14','Male','2025-10-18 08:37:58','Active'),(16,'phanthanhs','pass123','Phan Thanh Sơn','phanthanhs@example.com','0977889900','1989-07-19','Male','2025-10-18 08:37:58','Active'),(17,'maithut','pass123','Mai Anh Thư','maithut@example.com','0933221144','1993-11-03','Female','2025-10-18 08:37:58','Inactive'),(18,'duongminhu','pass123','Dương Minh Uy','duongminhu@example.com','0916789012','1990-12-25','Male','2025-10-18 08:37:58','Active'),(19,'caov','pass123','Cao Thị Vân','caov@example.com','0987654123','1995-05-30','Female','2025-10-18 08:37:58','Active'),(20,'luut','pass123','Lưu Trọng Tín','luut@example.com','0908765432','1987-02-14','Male','2025-10-18 08:37:58','Banned'),(21,'trinhy','pass123','Trịnh Thị Yến','trinhy@example.com','0965432109','1998-04-01','Female','2025-10-18 08:37:58','Active'),(22,'lyhuynhx','pass123','Lý Huỳnh Xuân','lyhuynhx@example.com','0912345876','1992-09-09','Other','2025-10-18 08:37:58','Active'),(23,'yune','yune1904','Thảo Uyên','dtliana04@gmail.com','0703479608','2005-04-19','Female','2025-10-19 10:33:38','active');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-19 18:31:29
