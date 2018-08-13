<?php
/**
 * @file
 * Recently view widget template file.
 */
?>
<div class="recently-viewed-widget">
  <div class="carousel-header">
    <h3><strong><?php print $title;?></strong></h3>
    <a class="clear-list" href="#"><?php print $text_clear_list;?></a>
    <div class="carousel-pages-wrapper">
      <div id="recently-viewed-pages" class="slide-nav"></div>
    </div>
  </div>

  <div class="recently-viewed-wrapper">
    <div id="recently-viewed-carousel"></div>
    <a href="#" id="recently-viewed-next"></a>
    <a href="#" id="recently-viewed-prev"></a>
  </div>
</div>
