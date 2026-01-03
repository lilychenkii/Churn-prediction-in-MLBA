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
-- Table structure for table `delivery`
--

DROP TABLE IF EXISTS `delivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery` (
  `deliveryid` bigint NOT NULL AUTO_INCREMENT,
  `orderid` bigint NOT NULL,
  `driverid` bigint NOT NULL,
  `pickup_time` timestamp NULL DEFAULT NULL,
  `dropoff_time` timestamp NULL DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `distance` decimal(10,2) DEFAULT NULL,
  `driver_fee` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`deliveryid`),
  KEY `fk_order_order_idx` (`orderid`),
  KEY `fk_delivery_driver_idx` (`driverid`),
  CONSTRAINT `fk_delivery_driver` FOREIGN KEY (`driverid`) REFERENCES `driver` (`driverid`),
  CONSTRAINT `fk_delivery_order` FOREIGN KEY (`orderid`) REFERENCES `order` (`orderid`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery`
--

LOCK TABLES `delivery` WRITE;
/*!40000 ALTER TABLE `delivery` DISABLE KEYS */;
INSERT INTO `delivery` VALUES (1,59,14,'2025-10-19 09:31:27','2025-10-19 10:01:27','Pending',5.00,0.00),(2,60,9,'2025-10-19 09:39:47','2025-10-19 10:09:47','Pending',5.00,30000.00),(3,61,1,'2025-10-19 10:03:49','2025-10-19 10:33:49','Pending',5.00,0.00),(4,62,14,'2025-10-19 10:13:44','2025-10-19 10:43:44','Pending',5.00,0.00),(5,63,1,'2025-10-19 10:23:55','2025-10-19 10:53:55','Pending',5.00,0.00),(6,64,9,'2025-10-19 10:25:34','2025-10-19 10:55:34','Pending',5.00,0.00),(7,65,9,'2025-10-19 10:40:54','2025-10-19 11:10:54','Pending',5.00,30000.00),(8,66,1,'2025-10-19 10:47:28','2025-10-19 11:17:28','Pending',5.00,30000.00),(9,67,9,'2025-10-19 10:51:55','2025-10-19 11:21:55','Pending',5.00,30000.00),(10,68,14,'2025-10-19 11:37:14','2025-10-19 12:07:14','Pending',5.00,0.00),(11,69,6,'2025-10-19 11:41:07','2025-10-19 12:11:07','Pending',5.00,30000.00),(12,70,6,'2025-10-19 11:43:08','2025-10-19 12:13:08','Pending',5.00,0.00);
/*!40000 ALTER TABLE `delivery` ENABLE KEYS */;
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
