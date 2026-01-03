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
-- Table structure for table `item`
--

DROP TABLE IF EXISTS `item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item` (
  `itemid` bigint NOT NULL AUTO_INCREMENT,
  `restaurantid` bigint NOT NULL,
  `categoryid` bigint NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `descriptionname` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `available` tinyint DEFAULT NULL,
  `rating_avg` decimal(3,2) DEFAULT NULL,
  `rating_count` int DEFAULT NULL,
  `image_url` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci,
  PRIMARY KEY (`itemid`),
  KEY `fk_item_restaurant_idx` (`restaurantid`),
  KEY `fk_item_category_idx` (`categoryid`),
  CONSTRAINT `fk_item_category` FOREIGN KEY (`categoryid`) REFERENCES `category` (`CategoryID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_item_restaurant` FOREIGN KEY (`restaurantid`) REFERENCES `restaurant` (`restaurantid`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
INSERT INTO `item` VALUES (10,10,6,'Vietnamese Iced Milk Coffee','Strong robusta coffee with condensed milk, served over ice.',35000.00,1,4.30,40,'images/coffee/Vietnamese Iced Milk Coffee.jpg'),(11,3,6,'Espresso Macchiato','A single espresso shot with a small layer of milk foam.',45000.00,1,2.20,67,'images/coffee/Espresso Macchiato.jpg'),(12,1,6,'Americano','Espresso diluted with hot water for a lighter taste.',40000.00,1,3.40,89,'images/coffee/americano.jpg'),(13,3,6,' Cold Brew','Coffee steeped in cold water for hours, smooth and less acidic.',40000.00,1,3.20,35,'images/coffee/Cold brew.jpg'),(14,1,6,'Citrus Lemongrass Cold Brew','Cold brew infused with citrus and lemongrass, light and refreshing.',55000.00,1,4.62,10,'images/coffee/Citrus Lemongrass Cold Brew.jpg'),(15,7,6,'Almond Mocha','Espresso mixed with milk, chocolate, and almond syrup.',55000.00,1,3.77,2,'images/coffee/Almond mocha.jpg'),(16,1,7,'Lychee Oolong Tea','Oolong tea brewed with lychee flavor, lightly sweet and floral.',45000.00,1,2.80,4,'images/tea_milktea/lychee olong tea.jpg'),(17,9,7,'Peach Lemongrass Tea','Black tea with peach and fresh lemongrass, fruity and refreshing.',50000.00,1,5.00,68,'images/tea_milktea/Peach Lemongrass Tea.jpg'),(18,8,7,'Jasmine Green Tea','Green tea scented with jasmine flowers, mild and fragrant.',45000.00,1,2.40,43,'images/tea_milktea/Jasmine Green Tea.jpg'),(19,10,7,'Earl Grey Milk Tea','Black tea with bergamot, blended with milk.',45000.00,1,4.10,7,'images/tea_milktea/Earl Grey Milk Tea.jpg'),(20,5,7,'Jasmine Milk Tea with Cream Cheese','Jasmine milk tea topped with a creamy cheese foam.',60000.00,1,4.30,15,'images/tea_milktea/Jasmine Milk Tea with Cream Cheese.jpg'),(21,7,7,'Matcha Milk Tea','Japanese matcha blended with milk, slightly bitter with a sweet finish.',50000.00,1,2.30,19,'images/tea_milktea/matcha milktea.jpg'),(22,7,8,'Matcha Frappuccino','Ice blended with matcha powder and milk.',65000.00,1,3.60,25,'images/frappuccino/Caramel Frappe.jpg'),(23,8,8,'Cookies & Cream Frappuccino','Ice blended with cookies and cream, sweet and rich.',65000.00,1,3.90,41,'images/frappuccino/cookies n cream frappe.jpg'),(24,4,8,'Caramel Frappuccino','Ice blended with caramel syrup and milk, topped with cream.',65000.00,1,4.10,58,'images/frappuccino/matcha frappe.jpg'),(25,5,9,'Matcha Latte','Matcha whisked with steamed milk, earthy and smooth.',60000.00,1,2.80,60,'images/latte/matcha latte.jpg'),(26,3,9,'Hazelnut Latte','Espresso and steamed milk with hazelnut flavor.',60000.00,1,3.40,90,'images/latte/Hazelnut Latte.jpg'),(27,10,9,'Sea Salt Caramel Latte','Latte with caramel syrup, finished with a hint of sea salt.',65000.00,1,2.45,98,'images/latte/Sea Salt Caramel Latte.jpg'),(28,1,1,'Mango Mousse Cake','Light mango mousse layered with chiffon cake and topped with fragrant mango sauce.',175000.00,1,3.75,82,'images/cold_cake/Mango-Mousse-Cake-Feature.jpg'),(29,2,1,'Cocoa Tiramisu','Classic tiramisu with wine-coffee soaked ladyfingers, mascarpone cream, and cocoa powder dusting.',180000.00,1,2.32,24,'images/cold_cake/cocoa tiramisu.png'),(30,10,1,'Jasmine Oolong Lychee',' Fragrant tea-infused cake combining floral jasmine, earthy oolong, and sweet tropical lychee flavors.',130000.00,1,4.56,36,'images/cold_cake/jasmine_oolong_cake.jpg'),(31,2,1,'Matcha Burnt Lava Cheesecake','Premium Japanese matcha cheesecake with smooth texture and rich green tea flavor.',150000.00,1,4.90,42,'images/cold_cake/matcha burnt lava cheesecake.jpg'),(32,10,1,'Flan Gato Cake','The spongy, light cake layer melts in your mouth, blending perfectly with the smooth, fragrant flan layer. The sweet caramel flavor is spread on top, creating the perfect highlight for the cake.',30000.00,1,3.72,3,'images/cold_cake/flan_gato.jpg'),(33,10,1,'Jelly Cake','The crystal clear jelly layer embraces each carefully selected raisin, bringing a rich sweet and sour taste mixed with a bit of interesting chewiness.',40000.00,1,2.99,7,'images/cold_cake/jelly_cake.jpg'),(34,5,2,'Bacon Cheddar Pie','Savory pie combining soft bread base with lightly salty bacon and fragrant cheddar cheese.',30000.00,1,4.95,55,'images/bread/bacon_cheddar_pie.jpg'),(35,6,2,'Thousand Layer Toast','Multi-layered bread with soft texture and the aromatic smell of butter and milk.',35000.00,1,3.75,67,'images/bread/Thousand_Layer_Toast.jpg'),(36,9,2,'Cheese and Garlic Butter Bread',' Soft, crispy-crusted bread layered with rich cheese and fragrant garlic butter.',35000.00,1,4.25,88,'images/bread/Cheese_Garlic_butter.jpg'),(37,3,2,'Hoang Kim Cheese Bread','Golden cheese bread topped with shredded chicken, seaweed, and melted golden cheese sauce.\n',100000.00,1,4.30,5,'images/bread/hoang_kim_cheese_bread.png'),(38,8,2,'Garlic Butter Croissant','Crispy croissant shell covered with fragrant garlic butter sauce and cream cheese with parsley.',25000.00,1,3.52,18,'images/bread/Garlic_butter_croissant.jpg'),(39,2,2,'Danish Cheese Bread','The crust is made from a mixture of fragrant, soft golden Danish flour, combined with the rich cheese inside, the cake will bring a complete flavor.',35000.00,1,2.40,59,'images/bread/Danish_cheese_bread.jpg'),(40,3,3,'Cheese stick','Crispy cheese sticks made from mixed fresh cheeses like Mozzarella and Parmesan with mild spiciness. ',60000.00,1,3.48,28,'images/cookies/Cheese_stick.jpg'),(41,1,3,'Mini Maccarone','Delicate almond flour macaron shells filled with various flavors like raspberry, matcha, and passion fruit.',80000.00,1,5.40,34,'images/cookies/mini_maccarone.jpg'),(42,10,3,'Cat Tounge','Thin, crispy butter cookies made from premium New Zealand butter that melt in your mouth.',75000.00,1,3.28,78,'images/cookies/cat_tounge.jpg'),(43,7,3,'Almond Cookies','Buttery, crumbly cookies packed with rich almond flavor and topped with crunchy sliced almonds.',65000.00,1,4.40,99,'images/cookies/almond_cookies.jpg'),(44,1,3,'Matcha Butter Cookies','Delicate butter cookies infused with premium Japanese matcha for an elegant earthy-sweet taste.',60000.00,1,4.89,102,'images/cookies/matcha_butter_cookies.jpg'),(45,8,3,'Brownie Cookies','Fudgy chocolate cookies with the rich, dense texture of brownies in bite-sized form.',60000.00,1,4.72,4,'images/cookies/brownie_cookies.jpg'),(46,1,4,'Portuguese Egg Tart (set of 4 cakes)','Egg Task with crunchy bread base, combined with a layer of lightly salty bacon and fragrant fatty cheddar cheese and eggs.',75000.00,1,3.55,89,'images/tart/egg_tart.jpg'),(47,5,4,'Fruit Oat Tart ',' Light pastry shell filled with fresh seasonal fruits and topped with crunchy oat crumble.',20000.00,1,4.60,43,'images/tart/fruit_oat_tart.jpg'),(48,7,4,'Patechaud','Flaky French pastry with layered dough filled with minced meat, pate, and rich spices.',25000.00,1,3.60,20,'images/tart/patechaud.jpg'),(49,10,5,'Steamed Milk Sponge Cake','Delicate, cloud-like steamed cake with subtle milk flavor and silky smooth texture.',60000.00,1,4.32,49,'images/sponge_cake/steamed_milk_cake.jpg'),(50,2,5,'Cheese Sponge Cake','Airy sponge cake infused with creamy cheese for a perfect balance of lightness and richness.',65000.00,1,4.50,26,'images/sponge_cake/cheese_sponge.jpg'),(51,4,5,'Banana Nuts Cake','Moist banana cake studded with crunchy nuts for natural sweetness and texture contrast.',35000.00,1,3.30,8,'images/sponge_cake/banana_nuts.jpg');
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-19 18:31:32
