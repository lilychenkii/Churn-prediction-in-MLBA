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
-- Table structure for table `restaurant`
--

DROP TABLE IF EXISTS `restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant` (
  `restaurantid` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `cuisine_type` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `address` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `rating_avg` decimal(3,2) DEFAULT NULL,
  `rating_count` int DEFAULT NULL,
  `is_active` tinyint DEFAULT NULL,
  PRIMARY KEY (`restaurantid`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant`
--

LOCK TABLES `restaurant` WRITE;
/*!40000 ALTER TABLE `restaurant` DISABLE KEYS */;
INSERT INTO `restaurant` VALUES (1,'Sweet Heaven Bakery','Bakery & Desserts','0901234567','125 Pasteur, Ward 6, District 3, Ho Chi Minh City',10.77770000,106.69130000,'07:00:00','22:00:00',4.80,245,1),(2,'Coffee Dream House','Coffee & Tea','0902345678','234 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City',10.77690000,106.70090000,'06:30:00','23:00:00',4.50,189,1),(3,'The Cake Garden','Bakery & Cafe','0903456789','456 Le Loi, Ben Thanh Ward, District 1, Ho Chi Minh City',10.77210000,106.69830000,'08:00:00','21:30:00',4.70,312,1),(4,'Golden Bread','Bakery','0904567890','789 Vo Van Tan, Ward 6, District 3, Ho Chi Minh City',10.77960000,106.69170000,'06:00:00','20:00:00',4.60,178,1),(5,'Milk Tea Paradise','Tea & Beverages','0905678901','321 Hai Ba Trung, Da Kao Ward, District 1, Ho Chi Minh City',10.78860000,106.69860000,'09:00:00','23:30:00',4.40,267,1),(6,'Artisan Coffee Lab','Coffee House','0906789012','147 Dien Bien Phu, Da Kao Ward, District 3, Ho Chi Minh City',10.79110000,106.69820000,'07:30:00','22:30:00',4.90,421,1),(7,'Dessert Kingdom','Desserts & Pastries','0907890123','258 Tran Hung Dao, Nguyen Cu Trinh Ward, District 1, Ho Chi Minh City',10.76340000,106.69130000,'08:30:00','21:00:00',4.30,156,1),(8,'French Patisserie','French Bakery','0908901234','369 Nguyen Thi Minh Khai, Da Kao Ward, District 1, Ho Chi Minh City',10.78990000,106.69510000,'07:00:00','22:00:00',4.80,389,1),(9,'Bubble Tea Station','Milk Tea & Drinks','0909012345','741 Cach Mang Thang 8, Ward 7, District 3, Ho Chi Minh City',10.78450000,106.67710000,'10:00:00','23:00:00',4.20,234,1),(10,'The Cookie Shop','Cookies & Sweets','0900123456','852 Ly Thuong Kiet, Ward 14, District 10, Ho Chi Minh City',10.77240000,106.66550000,'08:00:00','20:30:00',4.50,201,1);
/*!40000 ALTER TABLE `restaurant` ENABLE KEYS */;
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
