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
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `orderid` bigint NOT NULL AUTO_INCREMENT,
  `customerid` bigint NOT NULL,
  `restaurantid` bigint NOT NULL,
  `delivery_address` varchar(500) COLLATE utf8mb3_unicode_ci NOT NULL,
  `order_at` timestamp NULL DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `delivery_fee` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `coupon_code` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `notes` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci,
  PRIMARY KEY (`orderid`),
  KEY `fk_order_customer_idx` (`customerid`),
  KEY `fk_order_restaurant_idx` (`restaurantid`),
  CONSTRAINT `fk_order_customer` FOREIGN KEY (`customerid`) REFERENCES `customer` (`customerid`),
  CONSTRAINT `fk_order_restaurant` FOREIGN KEY (`restaurantid`) REFERENCES `restaurant` (`restaurantid`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (16,3,1,'11','2025-10-18 09:10:30','Completed',150000.00,15000.00,10000.00,155000.00,'GIAM10K','Ít ngọt'),(17,4,5,'15','2025-10-18 09:10:30','Completed',200000.00,18000.00,20000.00,198000.00,'SALE10','Làm nóng món lại giúp em'),(18,5,2,'20','2025-10-18 09:10:30','Delivering',120000.00,20000.00,0.00,140000.00,NULL,''),(19,6,8,'22','2025-10-18 09:10:30','Completed',300000.00,22000.00,30000.00,292000.00,'FREESHIP','Lấy nĩa và dĩa nhựa ăn kèm nha ạ'),(20,7,3,'30','2025-10-18 09:10:30','Cancelled',50000.00,15000.00,0.00,65000.00,NULL,'Giao nhanh'),(21,8,1,'12','2025-10-18 09:10:30','Completed',85000.00,14000.00,0.00,99000.00,'FREESHIP',''),(22,10,8,'18','2025-10-18 09:10:30','Completed',175000.00,25000.00,17500.00,182500.00,'SALE10','Giao liền'),(23,12,9,'15','2025-10-18 09:10:30','Completed',100000.00,16000.00,10000.00,106000.00,'GIAM10K',''),(24,15,5,'22','2025-10-18 09:10:30','Completed',450000.00,28000.00,50000.00,428000.00,'GIAM50K','Không lấy hóa đơn'),(25,17,8,'11','2025-10-18 09:10:30','Delivering',90000.00,17000.00,0.00,107000.00,NULL,'Gọi trước khi giao'),(26,20,1,'28','2025-10-18 09:10:30','Completed',55000.00,30000.00,0.00,85000.00,NULL,''),(27,21,4,'17','2025-10-18 09:10:30','Completed',130000.00,15000.00,10000.00,135000.00,'GIẠM10K','Không lấy hoá đơn'),(28,22,6,'19','2025-10-18 09:10:30','Cancelled',70000.00,15000.00,0.00,85000.00,NULL,'Cho em ít ngọt ạ'),(29,3,2,'29','2025-10-18 09:10:30','Completed',220000.00,21000.00,22000.00,219000.00,'SALE10',''),(30,5,9,'21','2025-10-18 09:10:30','Pending',110000.00,19000.00,0.00,129000.00,NULL,'Lấy bánh lạnh cho em nha'),(31,14,1,'ktx khu b','2025-10-19 03:12:43','pending',635000.00,30000.00,0.00,665000.00,NULL,'Nguoi nhan: Quỳnh\nSDT: 0348995803\n\ngiao nhanh'),(32,14,1,'ktx khu b','2025-10-19 03:12:43','pending',635000.00,30000.00,0.00,665000.00,NULL,'Nguoi nhan: Quỳnh\nSDT: 0348995803\n\ngiao nhanh'),(33,14,1,'cổng sau','2025-10-19 03:39:29','pending',220000.00,30000.00,0.00,250000.00,NULL,'giao liền'),(34,14,1,'cổng sau','2025-10-19 03:39:29','pending',220000.00,30000.00,0.00,250000.00,NULL,'giao liền'),(35,14,1,'cổng trước','2025-10-19 03:41:21','pending',70000.00,30000.00,0.00,100000.00,NULL,'hông có'),(36,14,1,'cổng trước','2025-10-19 03:41:21','pending',70000.00,30000.00,0.00,100000.00,NULL,'hông có'),(37,14,1,'hong nhớ','2025-10-19 03:52:20','pending',325000.00,30000.00,0.00,355000.00,NULL,'hong có'),(38,14,1,'h','2025-10-19 03:54:38','pending',695000.00,30000.00,0.00,725000.00,NULL,'h'),(39,14,1,'k','2025-10-19 03:56:24','pending',240000.00,30000.00,0.00,270000.00,NULL,'k'),(40,14,1,'hi','2025-10-19 05:43:43','pending',520000.00,30000.00,0.00,550000.00,NULL,'ha'),(41,14,1,'hi','2025-10-19 06:28:15','pending',340000.00,30000.00,0.00,370000.00,NULL,'ha'),(42,14,1,'hi','2025-10-19 06:28:23','pending',340000.00,30000.00,0.00,370000.00,NULL,'ha'),(43,14,1,'hi','2025-10-19 06:29:10','pending',165000.00,30000.00,0.00,195000.00,NULL,'ha'),(44,14,1,'hi','2025-10-19 06:29:24','pending',165000.00,30000.00,0.00,195000.00,NULL,'ha'),(45,14,1,'hi','2025-10-19 06:31:31','pending',285000.00,30000.00,0.00,315000.00,NULL,'ha'),(46,14,1,'hi','2025-10-19 06:45:27','pending_payment',2000000.00,30000.00,0.00,2030000.00,NULL,'giao nhanh'),(47,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 07:28:49','pending',35000.00,30000.00,0.00,65000.00,NULL,'hi'),(48,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 07:29:18','pending_payment',40000.00,30000.00,0.00,70000.00,NULL,'k'),(49,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 07:41:49','pending',205000.00,30000.00,10000.00,225000.00,'GIAM10K','hi'),(50,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 07:42:57','pending_payment',130000.00,30000.00,20000.00,140000.00,'NEWUSER','hi'),(51,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 07:57:50','pending_payment',395000.00,30000.00,0.00,425000.00,'SALE10','hi'),(52,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 08:14:57','pending_payment',395000.00,30000.00,30000.00,395000.00,'FREESHIP','hihi'),(53,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 08:34:35','pending_payment',345000.00,30000.00,51750.00,323250.00,'SALE15','giao liềnnnnn'),(54,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 08:37:10','pending_payment',345000.00,30000.00,10000.00,365000.00,'GIAM10K','kkk'),(55,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 08:49:36','pending_payment',435000.00,0.00,0.00,435000.00,NULL,'hi'),(56,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 09:02:58','pending_payment',85000.00,30000.00,8500.00,106500.00,'SALE10','hi'),(57,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 09:03:54','pending',45000.00,30000.00,20000.00,55000.00,'GIAM20K','j'),(58,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 09:11:43','pending_payment',435000.00,0.00,20000.00,415000.00,'GIAM20K','sos code mệt quáaaaaaaa '),(59,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 09:16:27','pending_payment',380000.00,0.00,38000.00,342000.00,'SALE10','qa met hiuhiu ghét code'),(60,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 09:24:47','pending',90000.00,30000.00,0.00,120000.00,NULL,'nghỉ ngủ'),(61,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 09:48:49','pending_payment',325000.00,0.00,15000.00,310000.00,'WEEKEND','doneeeee yeeeeee'),(62,3,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 09:58:43','pending_payment',340000.00,0.00,0.00,340000.00,NULL,'hi'),(63,3,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 10:08:54','pending_payment',345000.00,0.00,0.00,345000.00,NULL,'ok'),(64,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 10:10:34','pending',295000.00,0.00,0.00,295000.00,NULL,'kkkkkk'),(65,14,1,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 10:25:54','pending_payment',55000.00,30000.00,0.00,85000.00,NULL,'chua xong nua..'),(66,3,10,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 10:32:28','pending_payment',190000.00,30000.00,0.00,220000.00,NULL,'xongg'),(67,14,9,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 10:36:55','pending',85000.00,30000.00,0.00,115000.00,NULL,'s'),(68,3,2,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 11:22:14','pending_payment',245000.00,0.00,0.00,245000.00,NULL,'hi'),(69,3,9,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 11:26:07','pending_payment',45000.00,30000.00,0.00,75000.00,NULL,'1'),(70,23,7,'KTX Khu B, Đại học Quốc Gia\n04A Trần Nguyên Đán, thành phố Quy Nhơn','2025-10-19 11:28:08','pending',310000.00,0.00,0.00,310000.00,NULL,'xong thiệt hehe');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
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
