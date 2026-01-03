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
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `addressid` bigint NOT NULL AUTO_INCREMENT,
  `label` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `line1` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `ward` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `district` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `is_default` tinyint DEFAULT NULL,
  PRIMARY KEY (`addressid`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (11,'Nhà riêng','123 Đường Nguyễn Huệ','Phường Bến Nghé','Quận 1',10.77976100,106.70222100,1),(12,'Công ty','45A Lý Tự Trọng','Phường Bến Nghé','Quận 1',10.77888900,106.70001200,0),(13,'Nhà riêng','212/3 Pasteur','Phường 6','Quận 3',10.78201100,106.69250000,0),(14,'Căn hộ','789 Võ Văn Tần','Phường 5','Quận 3',10.77543200,106.68912300,1),(15,'Văn phòng','34 Lê Duẩn','Phường Bến Nghé','Quận 1',10.78311100,106.70200000,0),(16,'Nhà riêng','102 Nguyễn Trãi','Phường Nguyễn Cư Trinh','Quận 1',10.76451200,106.68532100,0),(17,'Nhà riêng','55 Trần Hưng Đạo','Phường Cầu Ông Lãnh','Quận 1',10.76812300,106.69945600,0),(18,'Căn hộ','Chung cư Vinhomes, Tòa Landmark 81','Phường 22','Quận Bình Thạnh',10.79513300,106.72191900,1),(19,'Công ty','Tầng 10, Tòa nhà Bitexco','Phường Nguyễn Thái Bình','Quận 1',10.77174600,106.70425000,0),(20,'Nhà riêng','441/50 Nguyễn Đình Chiểu','Phường 5','Quận 3',10.77663400,106.68777700,0),(21,'Nhà riêng','99 Hoàng Văn Thụ','Phường 8','Quận Phú Nhuận',10.79633300,106.67900000,0),(22,'Văn phòng','Tòa nhà E.Town 2, 364 Cộng Hòa','Phường 13','Quận Tân Bình',10.80371200,106.64303400,0),(23,'Nhà riêng','33 Phố Hàng Bài','Phường Hàng Bài','Quận Hoàn Kiếm',21.02345600,105.85234500,0),(24,'Công ty','Tầng 5, Tòa nhà Lotte Center','Phường Cống Vị','Quận Ba Đình',21.03312300,105.81945600,0),(25,'Nhà riêng','19 Nhà Chung','Phường Hàng Trống','Quận Hoàn Kiếm',21.02877100,105.84883400,1),(26,'Căn hộ','Royal City, 72 Nguyễn Trãi','Phường Thượng Đình','Quận Thanh Xuân',21.00288800,105.81555500,0),(27,'Nhà riêng','88 Láng Hạ','Phường Láng Hạ','Quận Đống Đa',21.01511100,105.81822200,0),(28,'Nhà riêng','65 Phan Đình Phùng','Phường Quán Thánh','Quận Ba Đình',21.04012300,105.84367800,0),(29,'Văn phòng','Tòa nhà Keangnam, E6 Phạm Hùng','Phường Mễ Trì','Quận Nam Từ Liêm',21.01698700,105.78201200,0),(30,'Nhà riêng','25T2 Hoàng Đạo Thúy','Phường Trung Hoà','Quận Cầu Giấy',21.00765400,105.80345600,0);
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
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
