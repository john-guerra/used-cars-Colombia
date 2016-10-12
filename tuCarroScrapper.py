import scrapy

class BlogSpider(scrapy.Spider):
    name = 'tuCarroScrapper'
    # start_urls = ['http://listado.tucarro.com.co/carros/renault/sandero-stepway/']
    # start_urls = ['http://listado.tucarro.com.co/carros/mazda/mazda-3/']
    start_urls = ['http://listado.tucarro.com.co/carros/renault/sandero-stepway/']


    rate = 1

    def __init__(self):
      scrapy.Spider.__init__(self)
      self.download_delay = 1/float(self.rate)

    def parse(self, response):
      print "Parse page"

      for car in response.css('#searchResults .rowItem'):
        print "Parse car "
        kms = car.css('.destaque strong::text').extract()[1].replace("Km", "")
        kms = kms.replace("kms", "")
        kms = kms.replace(",", "")
        kms = kms.strip()

        yield {
          'title':car.css('.list-view-item-title a::text').extract()[0],
          'price':car.css('.details .ch-price::text').extract()[0],
          'year':car.css('.destaque strong::text').extract()[0],
          'kms':kms,
          'link':car.css('.item-link::attr(href)').extract()[0],
          'img':car.css('.item-link img::attr(src)').extract()[0]
        }


      for anchor in response.css('.ch-pagination li a::attr(href)'):
        url = anchor.extract()
        print url
        print "Parse url=", response.urljoin(url)
        yield scrapy.Request(response.urljoin(url), self.parse)


    # def parse_car(self, car):
    #   print "Car function"
    #   return {
    #     'title':car.css('.list-view-item-title a::text').extract()[0],
    #     'price':car.css('.details .ch-price::text').extract()[0],
    #     'year':car.css('.destaque strong::text').extract()[0],
    #     'kms':car.css('.destaque strong::text').extract()[1],
    #     'link':car.css('.item-link::attr(href)').extract()[0],
    #     'img':car.css('.item-link img::attr(src)').extract()[0]
    #   }


    #     for post_title in response.css('#searchResults .ch-carousel-item a::text').extract():
    #         yield {'title': post_title}