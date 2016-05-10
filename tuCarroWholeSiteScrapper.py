import scrapy

class BlogSpider(scrapy.Spider):
    name = 'tuCarroScrapper'
    start_urls = ['http://listado.tucarro.com.co/carros/']


    # start_urls = ['http://listado.tucarro.com.co/carros/renault/sandero-stepway/']

    rate = 10

    def __init__(self):
      scrapy.Spider.__init__(self)
      self.download_delay = 1/float(self.rate)

    def parse(self, response):
      for maker in response.css('.nav.vertical-qcat dl#id_9991744-AMCO_1744_1 dd'):
        req = scrapy.Request(response.urljoin(maker.css('a::attr("href")').extract()[0]), self.parseMaker)
        req.meta["maker"] = maker.css("a::text").extract()[0]
        yield req


    def parseMaker(self, response):
      for model in response.css('.nav.vertical-qcat dl#id_9991744-AMCO_1744_2 dd'):
        req = scrapy.Request(response.urljoin(model.css('a::attr("href")').extract()[0]), self.parseCar)
        req.meta["model"] = model.css("a::text").extract()[0]
        req.meta["maker"] = response.meta["maker"]
        yield req


    def parseCar(self, response):

      for car in response.css('#searchResults .rowItem'):
        title = car.css('.list-view-item-title a::text').extract()[0]

        # # Check that the title includes the maker and model
        # if title.upper().find(response.meta['maker'].upper()) == -1 or \
        #    title.upper().find(response.meta['model'].upper()) == -1:
        #   print "Car title doesn't include maker/model skipping", response.meta['maker'], response.meta['model'], title
        #   continue


        print "Parse car ", title

        kms = car.css('.destaque strong::text').extract()[1].replace("Km", "")
        kms = kms.replace("kms", "")
        kms = kms.replace(",", "")
        kms = kms.strip()

        price = car.css('.details .ch-price::text').extract()[0].replace("$", "")
        price = price.replace(".", "")
        price = price.strip()

        yield {
          'title':title,
          'price':price,
          'year':car.css('.destaque strong::text').extract()[0],
          'kms':kms,
          'link':car.css('.item-link::attr(href)').extract()[0],
          'img':car.css('.item-link img::attr(src)').extract()[0],
          'maker':response.meta['maker'],
          'model':response.meta['model']
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